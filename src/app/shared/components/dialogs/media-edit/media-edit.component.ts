import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, FileInfo, MediaType} from "@memebox/contracts";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppQueries} from "../../../../state/app.queries";
import {distinctUntilChanged, filter, map, pairwise, startWith, takeUntil} from "rxjs/operators";
import {combineLatest, Subject} from "rxjs";

//TODO: clean up initial clip stuff - always populate
// clipLength + playLength so the user doesn't want to die
const INITIAL_CLIP: Partial<Clip> = {
  type: MediaType.Picture,
  name: 'Your Clip Name',
  volumeSetting: 10,
  playLength: 600
}

@Component({
  selector: 'app-media-edit',
  templateUrl: './media-edit.component.html',
  styleUrls: ['./media-edit.component.scss']
})
export class MediaEditComponent implements OnInit, OnDestroy {

  public form = new FormBuilder().group({
    id: '',
    name: '',
    type: 0,
    volumeSetting: 0,
    clipLength: 0,
    playLength: 0,
    path: '',
    previewUrl: '',
  });

  availableMediaFiles = combineLatest([
    this.appQuery.currentMediaFile$.pipe(
      filter(files => !!files)
    ),
    this.form.valueChanges.pipe(
      startWith(INITIAL_CLIP)
    )
  ]).pipe(
    map(([mediaFiles, currentFormValues]) =>{
      const currentFileType = currentFormValues.type;

     return mediaFiles.filter(m => m.fileType === currentFileType);
    })
  );

  private _destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clip,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private appQuery: AppQueries,
              private snackBar: MatSnackBar) {
    this.data = this.data ?? INITIAL_CLIP as any;
  }

  ngOnInit(): void {
    this.form.reset(this.data);
    this.appService.listFiles();

    this.form.valueChanges.pipe(
      map(value => value.type),
      distinctUntilChanged(),
      pairwise(),
      takeUntil(this._destroy$)
    ).subscribe(value => {
      console.info(value);
      this.form.patchValue({
        path: '',
        previewUrl: ''
      })
    })
  }

  async save() {
    const {value} = this.form;

    if (this.form.valid) {
      await this.appService.addOrUpdateClip(value);

      //TODO - "extract snackbar service to a service with fixed settings"
      this.snackBar.open(`Clip "${value.name}"  ${value.id ? 'updated' : 'added' } 🎉`, null, {
        duration: 4000,
        verticalPosition: 'top'
      });

      this.dialogRef.close();
    } else {
      // highlight hack
      this.form.markAllAsTouched();
    }
  }

  onChange($event: FileInfo) {
    console.info({$event});

    this.form.patchValue({
      path: $event.apiUrl
    })
  }

  get MediaType() {
    return MediaType;
  }

  updateMediaType(value: MediaType): void {
    this.form.patchValue({type: value})
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
