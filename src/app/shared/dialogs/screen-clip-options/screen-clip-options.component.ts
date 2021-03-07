import {Component, Inject, OnInit} from '@angular/core';
import {AppQueries} from "../../../state/app.queries";
import {combineLatest, Observable, Subject} from "rxjs";
import {
  ANIMATION_IN_ARRAY,
  ANIMATION_OUT_ARRAY,
  MediaType,
  PositionEnum,
  Screen,
  ScreenClip,
  VisibilityEnum
} from "@memebox/contracts";
import {map, take} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../state/app.service";
import {SnackbarService} from "../../../core/services/snackbar.service";

export interface ScreenClipOptionsPayload {
  screenId: string;
  clipId: string;
  name: string;
}

@Component({
  selector: 'app-screen-clip-options',
  templateUrl: './screen-clip-options.component.html',
  styleUrls: ['./screen-clip-options.component.scss']
})
export class ScreenClipOptionsComponent implements OnInit {

  // TODO formly?
  // TODO any other typed forms
  public form = new FormBuilder().group({
    id: '',
    width: '',
    height: '',

    visibility: VisibilityEnum.Play,
    loop: false,
    position: PositionEnum.FullScreen,
    left: '',
    right: '',
    bottom: '',
    top: '',
    transform: '',
    imgFit: '', // todo image fit setting as enum

    animationIn: '',
    animationInDuration: 0,
    animationOut: '',
    animationOutDuration: 0,

    zIndex: 1,

    customCss: ''
  });

  public MediaType = MediaType;
  public animateInList = ANIMATION_IN_ARRAY;

  public animateOutList = ANIMATION_OUT_ARRAY;

  public lockOptions = {
    size: false,
    position: false,
    transform: false
  };

  public currentScreen$: Observable<Screen> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data.screenId])
  );

  public clipInfo$: Observable<ScreenClip&{type: MediaType}> = combineLatest([
    this.currentScreen$,
    this.appQueries.clipMap$.pipe(
      map(clipMap => clipMap[this.data.clipId])
    )
  ]).pipe(
    map(([screen, clip]) => ({
      visibility: VisibilityEnum.Play,
      loop: false,
      position: PositionEnum.FullScreen,
      animationIn: '',
      animationOut: '',
      ...screen.clips[this.data.clipId],
      type: clip.type
    }))
  );



  private _clipInfo: ScreenClip = null;
  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ScreenClipOptionsPayload,
              private dialogRef: MatDialogRef<any>,
              private appQueries: AppQueries,
              private appService: AppService,
              private snackBar: SnackbarService) {
  }

  ngOnInit(): void {
    this.clipInfo$.pipe(
      take(1)
    ).subscribe(value => {
      this._clipInfo = value;

      this.form.reset(this._clipInfo);
      if (value.arrangeLock) {
        this.lockOptions = {...value.arrangeLock};
      }
    });
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const {value} = this.form;

    const newScreenClipValue: ScreenClip = {
      ...this._clipInfo,
      ...value,
      arrangeLock: this.lockOptions
    };

    await this.appService.addOrUpdateScreenClip(this.data.screenId, newScreenClipValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Screen / Clip Assignment updated`);

    this.dialogRef.close();
  }
}
