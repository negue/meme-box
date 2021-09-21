import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  Clip,
  ClipAssigningMode,
  Dictionary,
  MediaType,
  TwitchEventFields,
  TwitchEventTypes,
  TwitchTrigger,
  TwitchTypesArray,
  UnassignedFilterEnum
} from '@memebox/contracts';
import {AppQueries, AppService, SnackbarService} from '@memebox/app-state';
import {DialogService} from "../dialog.service";
import {distinctUntilChanged, filter, map, pairwise, startWith, take, takeUntil} from "rxjs/operators";

// TODO better class/interface name?
const INITIAL_TWITCH: Partial<TwitchTrigger> = {
  name: '',
  event: TwitchEventTypes.message,
  contains: '',
  screenId: '',
  active: true,
  roles: ['user'],
  extended: {},
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

const TwitchEventFieldConfig: TwitchEventFields = {
  [TwitchEventTypes.message]: {
    fields: {}
  },
  [TwitchEventTypes.raid]: {
    fields: {
      minValue: { enable: true, placeholder: "min_viewers_in_raid" },
      maxValue: { enable: true, placeholder: "max_viewers_in_raid" },
    }
  },
  [TwitchEventTypes.bits]: {
    fields: {
      minValue: { enable: true, placeholder: "min_bits_given" },
      maxValue: { enable: true, placeholder: "max_bits_given" },
    }
  },
  [TwitchEventTypes.ban]: {
    fields: {
    }
  },
  [TwitchEventTypes.subscription]: {
    fields: {
    }
  },
  [TwitchEventTypes.gift]: {
    fields: {
    }
  },

  [TwitchEventTypes.channelPoints]: {
    fields: {
      channelPointId: {enable: true}
    }
  },
}

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
    screenId: "",
    contains: "",
    channelPointId: "",
    minAmount: undefined,
    maxAmount: undefined,
    response: undefined,
    cooldown: [undefined, Validators.max(1000*60*60*10)]
  });

  twitchNotAuthenticated$ = this.appQuery.config$.pipe(
    map(config => !config.twitch?.token)
  );
  channelPoints$ = this.appService.channelPoints$();

  twitchEvents = TwitchTypesArray;
  TWITCH_LEVELS = TWITCH_LEVELS;

  twitchEventTypes = TwitchEventTypes;

  selectedMediaId$ = new BehaviorSubject('');

  twitchEventFields = TwitchEventFieldConfig;

  clipDictionary$: Observable<Dictionary<Clip>> = this.appQuery.clipMap$;
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

  showWarningClipSelection = false;

  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TwitchTrigger,
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
    this.selectedMediaId$.next(this.data.clipId);
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

    const newTwitchValue: TwitchTrigger = {
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

    if (newTwitchValue.event === TwitchEventTypes.channelPoints) {
      const allChannelPoints = await this.channelPoints$.pipe(
        take(1)
      ).toPromise();

      const selectedChannelPointData = allChannelPoints.find(c => c.id === newTwitchValue.channelPointId);

      newTwitchValue.channelPointData = {
        id: selectedChannelPointData.id,
        cost: selectedChannelPointData.cost,
        title: selectedChannelPointData.title,
        background_color: selectedChannelPointData.background_color,
        default_image: selectedChannelPointData.default_image,
        image: selectedChannelPointData.image
      };
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

      this.selectedMediaId$.next(clipId);
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
