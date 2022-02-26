import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  Action,
  ActionType,
  ClipAssigningMode,
  Dictionary,
  TwitchEventFields,
  TwitchEventTypes,
  TwitchTrigger,
  TwitchTypesArray,
  UnassignedFilterEnum
} from '@memebox/contracts';
import {AppQueries, AppService, SnackbarService} from '@memebox/app-state';
import {DialogService} from "../dialog.service";
import {distinctUntilChanged, filter, map, pairwise, startWith, take, takeUntil} from "rxjs/operators";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";

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

  canBroadcasterIgnoreCooldown = false;

  twitchNotAuthenticated$ = this.appQuery.config$.pipe(
    map(config => !config.twitch?.token)
  );
  channelPointsAsync = this.appService.channelPointsAsync();

  twitchEvents = TwitchTypesArray;
  TWITCH_LEVELS = TWITCH_LEVELS;

  twitchEventTypes = TwitchEventTypes;

  selectedMediaId$ = new BehaviorSubject('');

  twitchEventFields = TwitchEventFieldConfig;

  clipDictionary$: Observable<Dictionary<Action>> = this.appQuery.actionMap$;

  selectedAction$: Observable<Action> = combineLatest([
    this.clipDictionary$,
    this.selectedMediaId$
  ]).pipe(
    filter(([mediaMap, selectedMediaId]) => !!mediaMap && !!selectedMediaId),
    map(([mediaMap, selectedMediaId]) => mediaMap[selectedMediaId])
  );

  showScreenSelection$ = this.selectedAction$.pipe(
    filter(action => !!action),
    map(media => ![ActionType.Script, ActionType.Meta, ActionType.WidgetTemplate].includes(media.type) )
  );

  screenList$ = combineLatest([
    this.selectedAction$,
    this.appQuery.screensList$
  ]).pipe(
    map(([media, screenList]) => screenList.filter(screen => !!screen.clips[media.id]))
  );

  showWarningClipSelection = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  aliasesFrmControl = new FormControl();
  // Current Tags assigned to this clip
  currentAliases$ = new BehaviorSubject<string[]>([]);

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
    this.canBroadcasterIgnoreCooldown = this.data.canBroadcasterIgnoreCooldown;

    this.currentAliases$.next([...(this.data.aliases ?? [])]);
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
      ...value,
      canBroadcasterIgnoreCooldown: this.canBroadcasterIgnoreCooldown
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

      const aliaseseseses = this.currentAliases$.value;

      newTwitchValue.aliases = aliaseseseses;
    }

    if (newTwitchValue.event === TwitchEventTypes.channelPoints) {
      const allChannelPoints = await this.appService.channelPointsAsync();

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

  toggleRole(role: string): void {
    if (this.data.roles.includes(role)) {
      const indexOfRole = this.data.roles.indexOf(role);

      this.data.roles.splice(indexOfRole, 1);
    } else {
      this.data.roles.push(role);
    }
  }

  enterNewAlias($event: MatChipInputEvent) {
    const input = $event.input;
    const value = $event.value;

    const currentAliases = this.currentAliases$.value;

    // Add our tag
    if ((value || '').trim()) {
      currentAliases.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.aliasesFrmControl.setValue(null);
    this.currentAliases$.next(currentAliases);
  }

  removeAlias(alias: string) {
    const currentAliases = this.currentAliases$.value;

    const index = currentAliases.indexOf(alias);

    if (index >= 0) {
      currentAliases.splice(index, 1);
    }

    this.currentAliases$.next(currentAliases);
  }
}
