import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  Clip,
  ClipAssigningMode,
  Dictionary,
  Twitch,
  TwitchEventTypes,
  TwitchTypesArray,
  UnassignedFilterEnum
} from '@memebox/contracts';
import {AppService} from '../../../state/app.service';
import {AppQueries} from '../../../state/app.queries';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {DialogService} from "../dialog.service";
import {distinctUntilChanged, map, pairwise, startWith, take, takeUntil} from "rxjs/operators";

// TODO better class/interface name?
const INITIAL_TWITCH: Partial<Twitch> = {
  name: '',
  event: TwitchEventTypes.message,
  contains: '',
  active: true,
  roles: ['user']
};

interface TwitchLevelEntry {
  label: string;
  type: string;
}

const TWITCH_LEVELS: TwitchLevelEntry[] = [
  {
    type: 'broadcaster',
    label: 'Broadcaster'
  },
  {
    type: 'moderator',
    label: 'Moderator'
  },
  {
    type: 'vip',
    label: 'VIP'
  },
  {
    type: 'founder',
    label: 'Founder'
  },
  {
    type: 'subscriber',
    label: 'Subscriber'
  },
  {
    type: 'user',
    label: 'User'
  }
];

@Component({
  selector: 'app-twitch-edit',
  templateUrl: './twitch-edit.component.html',
  styleUrls: ['./twitch-edit.component.scss']
})
export class TwitchEditComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    id: "",
    name: "",
    event: "",
    clipId: "",
    contains: "",
    minAmount: undefined,
    maxAmount: undefined,
    response: undefined,
    cooldown: [undefined, Validators.max(1000*60*60*10)]
  });

  twitchEvents = TwitchTypesArray;
  TWITCH_LEVELS = TWITCH_LEVELS;

  twitchEventTypes = TwitchEventTypes;

  clipDictionary$: Observable<Dictionary<Clip>> = this.appQuery.clipMap$;

  showWarningClipSelection = false;

  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Twitch,
    private dialogRef: MatDialogRef<any>,
    private matDialog: MatDialog,
    private appService: AppService,
    private appQuery: AppQueries,
    private snackBar: SnackbarService,
    private dialogService: DialogService
  ) {
    // Todo find a better to get defaults & stuff
    this.data = Object.assign({}, {...INITIAL_TWITCH}, {
      ...this.data
    });
    this.data.roles = [...this.data.roles];
    console.info({data: this.data});
  }

  async save() {
    // Check if the form is valid
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();

      for (const [ctrlName, ctrl] of Object.entries(this.form.controls)) {
        console.info(ctrlName, ctrl.valid);
      }

      return;
    }

    const {value} = this.form;

    // check if a media item was selected
    if (!value.clipId) {
      this.showWarningClipSelection = true;
      return;
    }

    const newTwitchValue: Twitch = {
      ...this.data,
      ...value
    };


    // does already the same command exists?
    if (newTwitchValue.event === TwitchEventTypes.message) {
      // check state of current commands?
      const currentTwitchEvents = await this.appQuery.twitchEvents$.pipe(
        take(1)
      ).toPromise();

      if (currentTwitchEvents.some(t =>
        t.event === TwitchEventTypes.message
        && t.id !== newTwitchValue.id
        && t.contains === newTwitchValue.contains)) {
        const dialogResult = await this.dialogService.showConfirmationDialog({
          title: 'You already have the same command',
          content: 'Do you want to add the new one anyway?'
        });

        if (!dialogResult) {
          return;
        }
      }
    }

    await this.appService.addOrUpdateTwitchEvent(newTwitchValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Twitch "${newTwitchValue.name}" ${newTwitchValue.id ? 'updated' : 'added'}`);

    this.dialogRef.close();


  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        map((value) => value.event as TwitchEventTypes),
        startWith(this.form.value.type),
        distinctUntilChanged(),
        pairwise(),
        takeUntil(this._destroy$)
      )
      .subscribe(([prev, next]) => {
        console.info({prev, next});

        const containsControl = this.form.controls['contains'];
        if (next === TwitchEventTypes.message) {
          console.info('adding validators');
          containsControl.setValidators(Validators.required);
        }

        if (prev == TwitchEventTypes.message){
          console.info('clearing validators');
          containsControl.clearValidators();
          containsControl.setErrors(null);
          containsControl.markAsPristine();
          containsControl.markAsUntouched();
        }

        console.info({containsControl});
      });

    console.info({ data: this.data, form: this.form.value });

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
      dialogTitle: this.data.name || 'Twitch Event',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.Twitch,
      showOnlyUnassignedFilter: true
    });

    if (clipId) {
      console.info({clipId});

      this.form.patchValue({
        clipId
      });
    }
  }

  toggleRole(role: string) {
    if (this.data.roles.includes(role)) {
      const indexOfRole = this.data.roles.indexOf(role);

      this.data.roles.splice(indexOfRole, 1);
    } else {
      this.data.roles.push(role);
    }
  }
}
