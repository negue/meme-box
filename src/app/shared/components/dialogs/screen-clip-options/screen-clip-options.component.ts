import {Component, Inject, OnInit} from '@angular/core';
import {AppQueries} from "../../../../state/app.queries";
import {Observable, Subject} from "rxjs";
import {PositionEnum, ScreenClip} from "@memebox/contracts";
import {map, takeUntil} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface ScreenClipOptionsPayload {
  screenId: string;
  clipId: string;
}

@Component({
  selector: 'app-screen-clip-options',
  templateUrl: './screen-clip-options.component.html',
  styleUrls: ['./screen-clip-options.component.css']
})
export class ScreenClipOptionsComponent implements OnInit {

  public form = new FormBuilder().group({
    id: '',
    width: '',
    height: '',

    position: PositionEnum.FullScreen,
    left: '',
    right: '',
    bottom: '',
    top: '',
    imgFit: '', // todo image fit setting as enum
  })

  public clipInfo$: Observable<ScreenClip> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data.screenId].clips[this.data.clipId])
  );
  private _clipInfo: ScreenClip = null;
  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ScreenClipOptionsPayload,
              private dialogRef: MatDialogRef<any>,
              private appQueries: AppQueries,
              private appService: AppService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.clipInfo$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value =>  {
      this._clipInfo = {
        position: PositionEnum.FullScreen,
        ...value
      };

      this.form.reset(this._clipInfo);
    })
  }

  async save() {
    if (this.form.valid) {
      const {value} = this.form;

      const newScreenClipValue: ScreenClip = {
        ...this._clipInfo,
        ...value
      };

      await this.appService.addOrUpdateScreenClip(this.data.screenId, newScreenClipValue);

      // todo refactor "better way?" to trigger those snackbars
      this.snackBar.open(`Screen / Clip Assignment updated 🎉`);

      this.dialogRef.close();
    }
    else {
      // highlight hack
      this.form.markAllAsTouched();
    }
  }
}
