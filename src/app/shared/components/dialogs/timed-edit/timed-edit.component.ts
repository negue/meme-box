import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Clip, Dictionary, TimedClip} from '@memebox/contracts';
import {AppService} from '../../../../state/app.service';
import {AppQueries} from '../../../../state/app.queries';
import {SnackbarService} from '../../../../core/services/snackbar.service';
import {DialogService} from "../dialog.service";

// TODO better class/interface name?
const INITIAL_TIMED_CLIP: Partial<TimedClip> = {
  clipId:  '',
  everyXms: 1000 * 60  // 1min
};

@Component({
  selector: 'app-timed-edit',
  templateUrl: './timed-edit.component.html',
  styleUrls: ['./timed-edit.component.scss']
})
export class TimedEditComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    id: "",
    clipId: "",
    everyXms: undefined
  });

  clipDictionary$: Observable<Dictionary<Clip>> = this.appQuery.clipMap$;


  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TimedClip,
    private dialogRef: MatDialogRef<any>,
    private matDialog: MatDialog,
    private appService: AppService,
    private appQuery: AppQueries,
    private snackBar: SnackbarService,
    private dialogService: DialogService
  ) {
    // Todo find a better to get defaults & stuff
    this.data = Object.assign({}, {...INITIAL_TIMED_CLIP}, {
      ...this.data
    });
    console.info({data: this.data});
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }


    const {value} = this.form;

    const newTimedValue: TimedClip = {
      ...this.data,
      ...value
    };

    console.info(newTimedValue);
    await this.appService.addOrUpdateTimedEvent(newTimedValue);

    // todo refactor "better way?" to trigger those snackbars

    this.dialogRef.close();


  }

  ngOnInit(): void {
    this.form.reset(this.data);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async selectEventClip() {
    const clipId = await this.dialogService.showClipSelectionDialog(
      this.form.value.clipId, 'Select a clip: '
    )

    if (clipId) {
      console.info({clipId});

      this.form.patchValue({
        clipId
      });
    }
  }
}
