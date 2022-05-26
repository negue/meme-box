import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  Action,
  ACTION_TYPE_INFORMATION,
  ACTION_TYPE_INFORMATION_ARRAY,
  ActionType,
  FileInfo,
  MetaTriggerTypes,
  Tag
} from "@memebox/contracts";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {AppQueries, AppService, SnackbarService} from "@memebox/app-state";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  shareReplay,
  startWith,
  take,
  takeUntil
} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";
import {DialogService} from "../dialog.service";
import {
  actionDataToScriptConfig,
  actionDataToWidgetContent,
  applyDynamicIframeContentToClipData,
  applyScriptConfigToAction,
  convertMarkdownStructureToScript,
  convertScriptToMarkdownStructure,
  DynamicIframeContent,
  fromMarkdown,
  ScriptConfig,
  toMarkdown
} from "@memebox/utils";
import {Clipboard} from "@angular/cdk/clipboard";
import {DialogData} from "../dialog.contract";
import {ACTION_CONFIG_FLAGS} from "./media-edit.type-config";
import {downloadFile} from "@gewd/utils";

const DEFAULT_PLAY_LENGTH = 2500;
const META_DELAY_DEFAULT = 750;

const ACTION_DEFAULT_PROPERTIES: Partial<Action> = {
  tags: [],
  type: ActionType.Picture,
  name: 'Media Filename',
  volumeSetting: 10,
  gainSetting: 0,
  playLength: DEFAULT_PLAY_LENGTH,
  clipLength: DEFAULT_PLAY_LENGTH, // TODO once its possible to get the data from the clip itself
  metaDelay: META_DELAY_DEFAULT,
  metaType: MetaTriggerTypes.Random,

  showOnMobile: true,

  fromTemplate: ""
};

interface MediaTypeButton {
  type: ActionType;
  name: string;
  icon: string;
}
// TODO REFACTOR!!!!
// TODO maybe use "TYPES WITH PATH"
// TODO extract these informs to the media dictionary?
// TODO REFACTOR use an interface of possible enable/disable of config controls
// TODO hide tag selection for types that cant use it anyway

export interface MediaEditDialogPayload {
  actionToEdit: Partial<Action>,
  defaults?: Partial<Action>
}

@Component({
  selector: "app-media-edit",
  templateUrl: "./media-edit.component.html",
  styleUrls: ["./media-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaEditComponent
  implements OnInit, OnDestroy,  DialogData<MediaEditDialogPayload>
{
  public isEditMode = false;
  public actionToEdit: Action;

  public form = new FormBuilder().group({
    id: "",
    name: "",
    type: 0,
    volumeSetting: 0,
    gainSetting: 0,
    clipLength: 0,
    playLength: [0, Validators.min(0)],
    path: "",
    previewUrl: "",

    metaType: 0,
    metaDelay: 0,

    fromTemplate: "",
    queueName: "",
    description: ""
  });

  currentMediaType$ = new BehaviorSubject(ACTION_DEFAULT_PROPERTIES.type);

  availableMediaFiles$ = combineLatest([
    this.appQuery.currentMediaFile$.pipe(filter((files) => !!files)),
    this.currentMediaType$,
  ]).pipe(
    map(([mediaFiles, currentFileType]) => {
      return mediaFiles.filter((m) => m.fileType === currentFileType);
    })
  );

  ACTION_TYPE_INFORMATION = ACTION_TYPE_INFORMATION;
  ACTION_CONFIG_FLAGS = ACTION_CONFIG_FLAGS;

  mediaTypeList: MediaTypeButton[] = ACTION_TYPE_INFORMATION_ARRAY
    .map((value) => {
      return {
        icon: value.icon,
        name: value.translationKey,
        type: +value.mediaType
      }
    });


  availableScreens$ = this.appQuery.screensList$;
  selectedScreenId = '';
  showOnMobile = true;

  // region Tag specific

  // current available tags in memebox / state
  availableTags$ = this.appQuery.tagList$;

  // Current Tags assigned to this clip
  currentTags$ = new BehaviorSubject<Tag[]>([]);

  // Current custom HTML Content?
  currentHtmlConfig: DynamicIframeContent = null;
  currentHtmlToPreview$ = new BehaviorSubject<DynamicIframeContent>(null);
  triggerHtmlRefresh$ = new Subject();

  currentScript: ScriptConfig = null;

  // Get all actions that have the assigned tags
  taggedActions$ = combineLatest([
    this.currentTags$,
    this.appQuery.actionList$
  ]).pipe(
    map(([currentTags, allClips]) => {
      if (currentTags.length === 0) {
        return [];
      }

      const currentTagsSet = new Set(currentTags.map(t => t.id));

      return allClips.filter(c => c.id !== this.actionToEdit.id && c.tags?.some(t => currentTagsSet.has(t)));
    })
  )


  widgetTemplates$ = this.appQuery.actionList$.pipe(
    map(( allMedias) => {
      return allMedias.filter(c => c.type === ActionType.WidgetTemplate);
    }),
    shareReplay(1)
  );

  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagFormCtrl = new FormControl();  // needed in form?!
  localMediaFormCtrl = new FormControl();  // needed in form?!
  mediaPathTypeFormCtrl = new FormControl();  // needed in form?!

  // current "filtered" tags
  filteredTags$: Observable<Tag[]>;
  allQueueNames$: Observable<string[]> = this.appQuery.queueList$;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  // endregion

  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MediaEditDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private appService: AppService,
    private appQuery: AppQueries,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
    private clipboard: Clipboard,
    private snackbar: SnackbarService
  ) {
    const defaultValues = Object.assign({}, ACTION_DEFAULT_PROPERTIES, this.data?.defaults ?? {});
    this.setNewActionEditData(this.data?.actionToEdit, defaultValues);

    this.isEditMode = !!this.data?.actionToEdit;


    if (this.actionToEdit.type === ActionType.Widget) {
      this.currentHtmlConfig = actionDataToWidgetContent(this.actionToEdit);
      this.executeHTMLRefresh();
    }

    if ([ActionType.Script, ActionType.PermanentScript].includes(this.actionToEdit.type)) {
      this.currentScript = actionDataToScriptConfig(this.actionToEdit);
    }

    this.showOnMobile = this.actionToEdit.showOnMobile;

    this.currentMediaType$.next(this.actionToEdit.type);
  }

  get ActionType() {
    return ActionType;
  }

  ngOnInit(): void {
    this.fillUiRelatedDataBasedOnAction();

    this.appService.listFiles();

    this.form.valueChanges
      .pipe(
        map((value) => value.type as ActionType),
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

        if ([ActionType.Audio, ActionType.Video].includes(next) ) {
          this.form.patchValue({
            playLength: undefined
          });
        }

        if (ACTION_CONFIG_FLAGS[next].hasRequiredPlayLength) {
          this.form.patchValue({
            playLength: DEFAULT_PLAY_LENGTH
          });
        }

        if (ACTION_CONFIG_FLAGS[next].hasPathSelection) {
          this.form.controls['path'].setValidators([
            Validators.required,
          ]);
        } else {
          this.form.controls['path'].clearValidators();
        }
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

    this.triggerHtmlRefresh$.pipe(
      debounceTime(1000),
      takeUntil(this._destroy$)
    ).subscribe( () => {
      this.executeHTMLRefresh();
    });
  }

  fillUiRelatedDataBasedOnAction() {
    this.form.reset(this.actionToEdit);

    this.availableTags$.pipe(
      take(1)
    ).subscribe(allTags => {
      this.currentTags$.next(allTags.filter(tag => this.actionToEdit.tags.includes(tag.id)));
    });

    if (this.actionToEdit.fromTemplate) {
      this.onTemplateChanged(this.actionToEdit.fromTemplate);
    }

    this.triggerHTMLRefresh();
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

    const valueAsClip: Action = {
      ...this.actionToEdit, // base props that are not in the form
      ...value
    };

    const tagsToAssign = this.currentTags$.value;

    for (const tag of tagsToAssign) {
      if (!tag.id) {
        await this.appService.addOrUpdateTag(tag)
      }
    }

    valueAsClip.tags = tagsToAssign.map(tag => tag.id)

    valueAsClip.showOnMobile = this.showOnMobile;

    await this.appService.addOrUpdateAction(valueAsClip);

    if (this.selectedScreenId && valueAsClip.type !== ActionType.Meta) {
      this.appService.addOrUpdateScreenClip(this.selectedScreenId, {
        id: valueAsClip.id,
      });
    }

    this.dialogRef.close();
  }

  onLocalMediaSelected($event: string, mediaFiles: FileInfo[]): void {
    const foundMedia = mediaFiles.find(m => m.apiUrl === $event);

    this.form.patchValue({
      path: foundMedia.apiUrl,
      name: foundMedia.fileName
    });

    this.markForCheck();
  }

  markForCheck(): void {
    this.cd.markForCheck();
  }

  updateMediaType(value: ActionType): void {
    this.actionToEdit.type = value;
    this.form.patchValue({ type: value });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // region Tag specific methods

  // remove this clip
  removeTag(tag: Tag): void {
    const currentTags = this.currentTags$.value;

    const index = currentTags.indexOf(tag);

    if (index >= 0) {
      currentTags.splice(index, 1);
    }

    this.currentTags$.next(currentTags);
  }

  // Add an existing Tag to this media-clip
  selectedNewTag($event: MatAutocompleteSelectedEvent): void {
    const currentTags = this.currentTags$.value;
    currentTags.push($event.option.value);

    this.tagInput.nativeElement.value = '';
    this.tagFormCtrl.setValue(null);

    this.currentTags$.next(currentTags);
  }

  // Enters a completely new tag to this media-clip
  enterNewTag($event: MatChipInputEvent): void {
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


  // Add an existing Tag to this media-clip
  selectedNewQueue($event: MatAutocompleteSelectedEvent): void {
    this.form.patchValue({
      queueName: $event.option.value
    });
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

  async editHTML() {
    const dynamicIframeContent = actionDataToWidgetContent(this.actionToEdit);

    const dialogResult = await this.dialogService.showWidgetEdit({
      mediaId: this.actionToEdit.id,
      name: this.actionToEdit.name,
      iframePayload: dynamicIframeContent
    });

    if (dialogResult) {
      applyDynamicIframeContentToClipData(dialogResult, this.actionToEdit);

      this.currentHtmlConfig = dialogResult;
      this.executeHTMLRefresh();
      this.cd.detectChanges();
    }
  }

  triggerHTMLRefresh(): void {
    this.triggerHtmlRefresh$.next();
  }

  executeHTMLRefresh (): void {
    if (!this.isWidget()) {
      return;
    }

    const currentExtendedValues = this.actionToEdit.extended;

    const updatedHtmlDataset: DynamicIframeContent  = {
      ...this.currentHtmlConfig,
      variables: currentExtendedValues
    };

    this.currentHtmlToPreview$.next(updatedHtmlDataset);
  }

  async onTemplateChanged(mediaId: string) {
    console.info({mediaId});

    const templates = await this.widgetTemplates$.pipe(
      take(1)
    ).toPromise();

    const template = templates.find(t => t.id === mediaId);

    this.currentHtmlConfig = actionDataToWidgetContent(template);
    this.executeHTMLRefresh();
    this.cd.detectChanges();
  }

  async editScript() {
    const scriptConfig = actionDataToScriptConfig(this.actionToEdit);

    const dialogResult = await this.dialogService.showScriptEdit({
      mediaId: this.actionToEdit.id,
      name: this.actionToEdit.name,
      scriptConfig,
      actionType: this.actionToEdit.type
    });

    if (dialogResult) {
      applyScriptConfigToAction(dialogResult, this.actionToEdit);

      this.currentScript = dialogResult;
      this.cd.detectChanges();
    }
  }

  copyIdToClipboard() {
    if (this.clipboard.copy(this.actionToEdit.id)) {
      this.snackbar.normal("The Action ID was copied to the clipboard");
    }
  }

  // todo extract
  makeScreenshot(videoElement: HTMLVideoElement) {
    videoElement.controls = false;

    const WANTED_WIDTH = 320;
    const RATIO_TO_CHANGE = videoElement.videoWidth / WANTED_WIDTH;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth / RATIO_TO_CHANGE;
    canvas.height = videoElement.videoHeight / RATIO_TO_CHANGE;

    const ctx = canvas.getContext('2d');

    // ctx.scale(0.5,0.5);
    //draw image to canvas. scale to target dimensions
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    //convert to desired file format
    const dataPath = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

    this.form.patchValue({
      previewUrl: dataPath
    });

    /* DEBUG Created Image
    var w = window.open("", "_black");
    var image = new Image();
    image.src = dataPath

    w.document.write(image.outerHTML);
*/

      videoElement.controls = true;
    }

  onVideoLoaded($event: Event, videoElement: HTMLVideoElement): void {
    console.info('onVideoLoaded', $event);
    if (!this.form.value.previewUrl) {
      setTimeout(() => {
        this.makeScreenshot(videoElement);
      }, 1500);
    }
  }

  onSourceChange($event: Event, videoElement: HTMLVideoElement): void {
    console.info($event);


  }

  // region Import / Export Methods

  onFileInputChanged($event: Event): void {
    if (!ACTION_CONFIG_FLAGS[this.form.value.type].showImportExportPanel) {
      return;
    }

    if (this.form.value.type !== ActionType.Script){
      return;
    }


    const target = $event.target as HTMLInputElement;
    const files = target.files;

    const file = files[0];

    console.info({$event, file});

    // setting up the reader
    const reader = new FileReader();
    reader.readAsText(file,'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      const content = readerEvent.target.result; // this is the content!

      if (typeof content === 'string' ) {
        const parseMarkdownStructure = fromMarkdown(content);

        const actionToImport = convertMarkdownStructureToScript(parseMarkdownStructure);

        console.info({
          parseMarkdownStructure,
          actionToImport
        });
        this.setNewActionEditData(actionToImport);
        this.fillUiRelatedDataBasedOnAction();

        // const importedPayload: DynamicIframeContent = JSON.parse(content);

        // this.setWorkingValues(importedPayload);
      }
    }
  }

  exportAction(): void {
    if (this.form.value.type !== ActionType.Script){
      return;
    }

    const mdStructure = convertScriptToMarkdownStructure(this.actionToEdit);

    const createdMarkdownString = toMarkdown(mdStructure);

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(createdMarkdownString);

    console.info({mdStructure, dataStr});
    downloadFile(this.actionToEdit.name+'-script.md',dataStr);
  }


  // endregion Import / Export Methods

  // region Helper Methods

  private currentActionType (): ActionType {
    return this.form.value.type;
  }

  private isWidget() {
    return [ActionType.Widget, ActionType.WidgetTemplate].includes(this.currentActionType());
  }

  private setNewActionEditData (newActionData: Partial<Action>, defaultValues = ACTION_DEFAULT_PROPERTIES) {
    this.actionToEdit = Object.assign({}, defaultValues, {
      ...newActionData,
      extended: {
        ...newActionData?.extended
      }
    }) as Action;
  }

  // endregion Helper Methods
}
