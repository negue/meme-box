import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Subject} from "rxjs";
import {AppQueries} from "../../../state/app.queries";
import {AppService} from "../../../state/app.service";
import {filter, take} from "rxjs/operators";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config, TwitchConfig} from "@memebox/contracts";
import {ConfigService} from "../../../state/config.service";


@Component({
  selector: 'app-twitch-connection-edit',
  templateUrl: './twitch-connection-edit.component.html',
  styleUrls: ['./twitch-connection-edit.component.scss']
})
export class TwitchConnectionEditComponent implements OnInit {
  @Input()
  public showAdvancedOptions = true;

  public mainAccountForm = new FormBuilder().group({
    name: ''
  });

  public botAccountForm = new FormBuilder().group({
    bot: false,
    botName: '',
    botToken: '',
    botResponse: ''
  });

  public editMode = false;

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  private botIntegrationEnabled = false;
  public commandsFlagMessage = '{{commands}}';
  public userFlagMessage = '{{user}}';

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService,) {

  }

  ngOnInit(): void {
    this.mainAccountForm.reset({
      name: 'my-channel'
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitch.channel),
      take(1),
    ).subscribe(value => {
      this.mainAccountForm.reset({
        name: value.twitch.channel
      });
    });

    this.botAccountForm.reset({
      botName: '',
      botToken: '',
      botResponse: ''
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitch),
      take(1)
    ).subscribe(value => {
      this.botAccountForm.reset({
        botName: value.twitch?.bot?.auth?.name ?? '',
        botToken: value.twitch?.bot?.auth?.token ?? '',
        botResponse: value.twitch?.bot?.response ?? ''
      });
      this.botIntegrationEnabled = value.twitch.bot.enabled;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async save() {
    if (!this.mainAccountForm.valid) {
      // highlight hack
      this.mainAccountForm.markAllAsTouched();
      return;
    }

    this.editMode = false;
    await this.configService.updateTwitchChannel(this.mainAccountForm.value.name);
  }

  toggleOrSave() {
    if (this.editMode) {
      this.save();
    } else {
      this.editMode = true;
    }
  }

  onCheckboxChanged($event: MatCheckboxChange, config: Partial<Config>) {
    this.configService.updateTwitchLogs($event.checked);
  }

  saveBotData(): Promise<void> {
    if (!this.botAccountForm.valid) {
      // highlight hack
      this.botAccountForm.markAllAsTouched();
      return;
    }

    const twitchBot: TwitchConfig = {
      channel: '',
      token: '',
      bot:{
        response: this.botAccountForm.value.botResponse,
        enabled: this.botIntegrationEnabled,
        auth: {
          name: this.botAccountForm.value.botName,
          token: this.botAccountForm.value.botToken
        }
      }
    };

    this.configService.updateTwitchBotData(twitchBot);
  }

  onBotIntegrationChanged($event: MatCheckboxChange, config: Partial<Config>){
    this.configService.updateTwitchBotIntegration($event.checked);
  }
}
