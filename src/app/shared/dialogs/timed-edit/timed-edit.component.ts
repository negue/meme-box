import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Action, ClipAssigningMode, Dictionary, TimedAction, UnassignedFilterEnum} from '@memebox/contracts';
import {AppQueries, AppService, SnackbarService} from '@memebox/app-state';
import {DialogService} from "../dialog.service";
import {filter, map} from "rxjs/operators";

// TODO better class/interface name?
const INITIAL_TIMED_ACTION: Partial<TimedAction> = {
  clipId:  '',
  screenId: '',
  active: true,
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
    screenId: "",
    everyXms: [undefined, Validators.max(19_999_999)]
  });

  clipDictionary$: Observable<Dictionary<Action>> = this.appQuery.actionMap$;

  showWarningClipSelection = false;

  selectedActionId$ = new BehaviorSubject('');

  selectedAction$: Observable<Action> = combineLatest([
    this.clipDictionary$,
    this.selectedActionId$
  ]).pipe(
    filter(([actionMap, selectedActionId]) => !!actionMap && !!selectedActionId),
    map(([actionMap, selectedActionId]) => actionMap[selectedActionId]),
    filter(selectedAction => !!selectedAction)
  );



  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TimedAction,
    private dialogRef: MatDialogRef<any>,
    private matDialog: MatDialog,
    private appService: AppService,
    private appQuery: AppQueries,
    private snackBar: SnackbarService,
    private dialogService: DialogService
  ) {
    // Todo find a better to get defaults & stuff
    this.data = Object.assign({}, {...INITIAL_TIMED_ACTION}, {
      ...this.data
    });

    this.selectedActionId$.next(this.data.clipId);
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const {value} = this.form;

    if (!value.clipId) {
      this.showWarningClipSelection = true;
      return;
    }

    const newTimedValue: TimedAction = {
      ...this.data,
      ...value
    };

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
    const clipId = await this.dialogService.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Single,
      selectedItemId: this.form.value.clipId,
      dialogTitle: 'Timer',
      showMetaItems: true,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Timers
    });

    if (clipId) {
      this.form.patchValue({
        clipId
      });
      this.selectedActionId$.next(clipId);
    }
  }

  set10Seconds(): void {
    this.form.patchValue({
      'everyXms': 10_000
    });
  }

  setXMinutes(number: number): void {
    this.form.patchValue({
      'everyXms': 60_000 * number
    });
  }
}
