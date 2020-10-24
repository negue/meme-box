import {Component, Inject, OnInit} from '@angular/core';
import {AppQueries} from "../../../../state/app.queries";
import {Observable, Subject} from "rxjs";
import {
  ANIMATION_IN_ARRAY,
  ANIMATION_OUT_ARRAY,
  PositionEnum,
  Screen,
  ScreenClip,
  VisibilityEnum
} from "@memebox/contracts";
import {map, takeUntil} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {SnackbarService} from "../../../../core/services/snackbar.service";

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
    imgFit: '', // todo image fit setting as enum

    animationIn: '',
    animationOut: '',

    zIndex: 1,

    customCss: ''
  });

  public animateInList = ANIMATION_IN_ARRAY;

  public animateOutList = ANIMATION_OUT_ARRAY;

  public currentScreen$: Observable<Screen> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data.screenId])
  );

  public clipInfo$: Observable<ScreenClip> = this.currentScreen$.pipe(
    map(screen => ({
      visibility: VisibilityEnum.Play,
      loop: false,
      position: PositionEnum.FullScreen,
      animationIn: '',
      animationOut: '',
      ...screen.clips[this.data.clipId]
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
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this._clipInfo = value;

      this.form.reset(this._clipInfo);
    })
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
      ...value
    };

    await this.appService.addOrUpdateScreenClip(this.data.screenId, newScreenClipValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Screen / Clip Assignment updated`);

    this.dialogRef.close();
  }
}
