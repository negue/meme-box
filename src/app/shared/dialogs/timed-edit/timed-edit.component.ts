import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Clip, ClipAssigningMode, Dictionary, MediaType, TimedClip, UnassignedFilterEnum} from '@memebox/contracts';
import {AppService} from '../../../state/app.service';
import {AppQueries} from '../../../state/app.queries';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {DialogService} from "../dialog.service";
import {filter, map} from "rxjs/operators";

// TODO better class/interface name?
const INITIAL_TIMED_CLIP: Partial<TimedClip> = {
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

  clipDictionary$: Observable<Dictionary<Clip>> = this.appQuery.clipMap$;

  showWarningClipSelection = false;

  selectedMediaId$ = new BehaviorSubject('');

  selectedMedia$ = combineLatest([
    this.clipDictionary$,
    this.selectedMediaId$
  ]).pipe(
    filter(([mediaMap, selectedMediaId]) => !!mediaMap && !!selectedMediaId),
    map(([mediaMap, selectedMediaId]) => mediaMap[selectedMediaId])
  );

  showScreenSelection$ = this.selectedMedia$.pipe(
    map(media => ![MediaType.Script, MediaType.Meta, MediaType.WidgetTemplate].includes(media.type) )
  );

  screenList$ = combineLatest([
    this.selectedMedia$,
    this.appQuery.screensList$
  ]).pipe(
    map(([media, screenList]) => screenList.filter(screen => !!screen.clips[media.id]))
  );


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
    this.selectedMediaId$.next(this.data.clipId);
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
    const clipId = await this.dialogService.showClipSelectionDialog({
      mode: ClipAssigningMode.Single,
      selectedItemId: this.form.value.clipId,
      dialogTitle: 'Timer',
      showMetaItems: true,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Timers
    });

    if (clipId) {
      console.info({clipId});

      this.form.patchValue({
        clipId
      });
      this.selectedMediaId$.next(clipId);
    }
  }

  set10Seconds() {
    this.form.patchValue({
      'everyXms': 10_000
    });
  }

  setXMinutes(number: number) {
    this.form.patchValue({
      'everyXms': 60_000 * number
    });
  }
}
