import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, FileInfo, MEDIA_TYPE_INFORMATION, MediaType, MetaTriggerTypes, Tag} from "@memebox/contracts";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {AppQueries} from "../../../../state/app.queries";
import {distinctUntilChanged, filter, map, pairwise, startWith, take, takeUntil,} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";

const DEFAULT_PLAY_LENGTH = 2500;
const META_DELAY_DEFAULT = 750;

const INITIAL_CLIP: Partial<Clip> = {
  tags: [],
  type: MediaType.Picture,
  name: 'Media Filename',
  volumeSetting: 10,
  playLength: DEFAULT_PLAY_LENGTH,
  clipLength: DEFAULT_PLAY_LENGTH, // TODO once its possible to get the data from the clip itself
  metaDelay: META_DELAY_DEFAULT,
  metaType: MetaTriggerTypes.Random,

  showOnMobile: true
};

interface MediaTypeButton {
  type: MediaType;
  name: string;
  icon: string;
}

@Component({
  selector: "app-media-edit",
  templateUrl: "./media-edit.component.html",
  styleUrls: ["./media-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaEditComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    id: "",
    name: "",
    type: 0,
    volumeSetting: 0,
    clipLength: 0,
    playLength: 0,
    path: "",
    previewUrl: "",

    metaType: 0,
    metaDelay: 0,
  });

  currentMediaType$ = new BehaviorSubject(INITIAL_CLIP.type);

  availableMediaFiles$ = combineLatest([
    this.appQuery.currentMediaFile$.pipe(filter((files) => !!files)),
    this.currentMediaType$,
  ]).pipe(
    map(([mediaFiles, currentFileType]) => {
      return mediaFiles.filter((m) => m.fileType === currentFileType);
    })
  );

  MEDIA_TYPE_INFORMATION = MEDIA_TYPE_INFORMATION;
  mediaTypeList: MediaTypeButton[] = Object.entries(MEDIA_TYPE_INFORMATION)
    .map(([mediaType, value]) => {
      return {
        icon: value.icon,
        name: value.label,
        type: +mediaType
      }
    });


  availableScreens$ = this.appQuery.screensList$;
  selectedScreenId:string = '';
  showOnMobile = true;

  // region Tag specific

  // current available tags in memebox / state
  availableTags$ = this.appQuery.tagList$;

  // Current Tags assigned to this clip
  currentTags$ = new BehaviorSubject<Tag[]>([]);

  // Get all clips that have the assigned tags
  taggedClips$ = combineLatest([
    this.currentTags$,
    this.appQuery.clipList$
  ]).pipe(
    map(([currentTags, allClips]) => {
      if (currentTags.length === 0) {
        return [];
      }

      const currentTagsSet = new Set(currentTags.map(t => t.id));

      return allClips.filter(c => c.id !== this.data.id && c.tags?.some(t => currentTagsSet.has(t)));
    })
  )

  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagFormCtrl = new FormControl();  // needed in form?!

  // current "filtered" tags
  filteredTags$: Observable<Tag[]>;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  // endregion

  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Clip,
    private dialogRef: MatDialogRef<any>,
    private appService: AppService,
    private appQuery: AppQueries
  ) {
    this.data = Object.assign({}, INITIAL_CLIP, this.data);

    this.showOnMobile = this.data.showOnMobile;

    this.currentMediaType$.next(this.data.type);
  }

  get MediaType() {
    return MediaType;
  }

  ngOnInit(): void {
    this.form.reset(this.data);
    this.appService.listFiles();

    this.form.valueChanges
      .pipe(
        map((value) => value.type as MediaType),
        startWith(this.form.value.type),
        distinctUntilChanged(),
        pairwise(),
        takeUntil(this._destroy$)
      )
      .subscribe(([prev, next]) => {
        this.currentMediaType$.next(next);

        this.form.patchValue({
          path: "",
          previewUrl: "",
        });

        if ([MediaType.Audio, MediaType.Video].includes(next) ) {
          this.form.patchValue({
            playLength: undefined
          });
        }

        if ([MediaType.Picture, MediaType.IFrame].includes(next)) {
          this.form.patchValue({
            playLength: DEFAULT_PLAY_LENGTH
          });
        }

        if (prev === MediaType.Meta) {
          console.info('adding validators');
          this.form.controls['path'].setValidators(Validators.required);
        }

        if (next == MediaType.Meta){
          console.info('clearing validators');
          this.form.controls['path'].clearValidators();
        }
      });

    this.availableTags$.pipe(
      take(1)
    ).subscribe(allTags => {
      this.currentTags$.next(allTags.filter(tag => this.data.tags.includes(tag.id)));
    });

    this.filteredTags$ = combineLatest([
      this.tagFormCtrl.valueChanges.pipe(
        startWith(null)
      ),
      this.availableTags$,
      this.currentTags$
    ]).pipe(
      map(([tagInputValue, allTags, currentTags]) => this._filter(tagInputValue, allTags, currentTags))
    );
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      console.info(this.form);

      for (const [ctrlName, ctrl] of Object.entries(this.form.controls)) {
        console.info(ctrlName, ctrl.valid);
      }

      return;
    }

    const { value } = this.form;

    const valueAsClip: Clip = value;

    const tagsToAssign = this.currentTags$.value;

    for (const tag of tagsToAssign) {
      if (!tag.id) {
        await this.appService.addOrUpdateTag(tag)
      }
    }

    valueAsClip.tags = tagsToAssign.map(tag => tag.id)

    valueAsClip.showOnMobile = this.showOnMobile;

    await this.appService.addOrUpdateClip(valueAsClip);

    if (this.selectedScreenId && valueAsClip.type !== MediaType.Meta) {
      this.appService.addOrUpdateScreenClip(this.selectedScreenId, {
        id: valueAsClip.id,
      });
    }

    this.dialogRef.close();
  }

  onChange($event: FileInfo) {
    console.info({ $event });

    this.form.patchValue({
      path: $event.apiUrl,
      name: $event.fileName
    });
  }

  updateMediaType(value: MediaType): void {
    this.form.patchValue({ type: value });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // region Tag specific methods

  // remove this clip
  removeTag(tag: Tag) {
    const currentTags = this.currentTags$.value;

    const index = currentTags.indexOf(tag);

    if (index >= 0) {
      currentTags.splice(index, 1);
    }

    this.currentTags$.next(currentTags);
  }

  // Add an existing Tag to this media-clip
  selectedNewTag($event: MatAutocompleteSelectedEvent) {
    const currentTags = this.currentTags$.value;
    currentTags.push($event.option.value);

    this.tagInput.nativeElement.value = '';
    this.tagFormCtrl.setValue(null);

    this.currentTags$.next(currentTags);
  }

  // Enters a completely new tag to this media-clip
  enterNewTag($event: MatChipInputEvent) {
    const input = $event.input;
    const value = $event.value;

    const currentTags = this.currentTags$.value;


    // Add our tag
    if ((value || '').trim()) {
      currentTags.push({
        color: '',
        id: '',
        name: value.trim()
      } as Tag);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagFormCtrl.setValue(null);
    this.currentTags$.next(currentTags);
  }

  private _filter(value: string, allTags: Tag[], currentTags: Tag[]): Tag[] {
    const currentTagsSet = new Set(currentTags.map(t => t.id));

    // Ignore current selected tags
    const remainingTags = allTags.filter(t => !currentTagsSet.has(t.id))

    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();

      return remainingTags.filter(tag => tag.name.toLowerCase().indexOf(filterValue) === 0);
    }

    return remainingTags;
  }

  // endregion
}
