import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, FileInfo, MediaType} from "@memebox/contracts";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {AppQueries} from "../../../../state/app.queries";
import {distinctUntilChanged, filter, map, pairwise, startWith, takeUntil,} from "rxjs/operators";
import {combineLatest, Subject} from "rxjs";
import {SnackbarService} from "../../../../core/services/snackbar.service";

const DEFAUULT_PLAY_LENGTH =  600;

//TODO: clean up initial clip stuff - always populate
// clipLength + playLength so the user doesn't want to die
const INITIAL_CLIP: Partial<Clip> = {
  type: MediaType.Picture,
  name: 'Media Filename',
  volumeSetting: 10,
  playLength: DEFAUULT_PLAY_LENGTH,
  clipLength: DEFAUULT_PLAY_LENGTH, // TODO once its possible to get the data from the clip itself
};

@Component({
  selector: "app-media-edit",
  templateUrl: "./media-edit.component.html",
  styleUrls: ["./media-edit.component.scss"],
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
  });

  availableMediaFiles = combineLatest([
    this.appQuery.currentMediaFile$.pipe(filter((files) => !!files)),
    this.form.valueChanges.pipe(startWith(INITIAL_CLIP)),
  ]).pipe(
    map(([mediaFiles, currentFormValues]) => {
      const currentFileType = currentFormValues.type;

      return mediaFiles.filter((m) => m.fileType === currentFileType);
    })
  );

  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Clip,
    private dialogRef: MatDialogRef<any>,
    private appService: AppService,
    private appQuery: AppQueries,
    private snackBar: SnackbarService
  ) {
    this.data = this.data ?? (INITIAL_CLIP as any);
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
            playLength: DEFAUULT_PLAY_LENGTH
          });
        }
      });
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const { value } = this.form;

    await this.appService.addOrUpdateClip(value);

    this.snackBar.normal(
      `Clip "${value.name}"  ${value.id ? "updated" : "added"}`
    );

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
}
