import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder} from '@ngneat/reactive-forms';
import {Subject} from "rxjs";
import {AppQueries} from "../../../../../projects/app-state/src/lib/state/app.queries";
import {AppService} from "../../../../../projects/app-state/src/lib/state/app.service";
import {filter, take} from "rxjs/operators";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {TwitchOAuthHandler} from "./twitch.oauth";

const currentUrl = `${location.origin}`;
const scopes = [
  // 'user:read:email',            // ???
  'chat:read',                     // TMI - Chat
  'chat:edit',                     // TMI - Write to chat?
  'channel:read:redemptions',      // PubSub Channelpoints Event
  'channel:manage:redemptions'     // Twitch API Change Channelpoint Redemptions
].join('+');
const clientId = 'zmqh0d2kwa9r24eecywm5uhhryggm4';

interface MainAccountForm {
  channelName: string;
  authToken: string;
  botName: string;
  botToken: string;
}

interface AdditionalForm {
  bot: boolean;
  log: boolean;
  botResponse: string;
}

@Component({
  selector: 'app-twitch-connection-edit',
  templateUrl: './twitch-connection-edit.component.html',
  styleUrls: ['./twitch-connection-edit.component.scss']
})
export class TwitchConnectionEditComponent implements OnInit {
  @Input()
  public showAdvancedOptions = true;

  public mainAccountForm = new FormBuilder().group<MainAccountForm>({
    channelName: '',
    authToken: '',
    botName: '',
    botToken: '',
  });

  public additionalForm = new FormBuilder().group<AdditionalForm>({
    bot: false,
    log: false,
    botResponse: ''
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  public commandsFlagMessage = '{{commands}}';
  public userFlagMessage = '{{user}}';

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService,) {

  }

  ngOnInit(): void {
    this.mainAccountForm.reset({
      channelName: 'my-channel',
      botName: '',
      botToken: '',
    });

    this.additionalForm.reset({
      botResponse: ''
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitch),
      take(1),
    ).subscribe(value => {
      console.info({ value });

      this.mainAccountForm.reset({
        channelName: value.twitch.channel,
        authToken: value.twitch.token,
        botName: value.twitch?.bot?.auth?.name ?? '',
        botToken: value.twitch?.bot?.auth?.token ?? '',
      });

      this.additionalForm.reset({
        botResponse: value.twitch?.bot?.response ?? '',
        bot: value.twitch.bot.enabled
      });

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


      // TODO jump to Tab 1

      return;
    }

    if (!this.additionalForm.valid) {
      // highlight hack
      this.additionalForm.markAllAsTouched();

      // TODO jump to Tab 2

      return;
    }


    const mainAccountValues = this.mainAccountForm.value;
    const botValues = this.additionalForm.value;

    await this.configService.updateTwitchConfig({
      channel: mainAccountValues.channelName,
      token: mainAccountValues.authToken,
      enableLog: botValues.log,
      bot: {
        enabled: botValues.bot,
        response: botValues.botResponse,
        auth: {
          name: mainAccountValues.botName,
          token: mainAccountValues.botToken
        }
      }
    });
  }

  onCheckboxChanged($event: MatCheckboxChange, config: Partial<Config>) {
    this.additionalForm.patchValue({
      log: $event.checked
    });
  }


  onBotIntegrationChanged($event: MatCheckboxChange, config: Partial<Config>){
    this.additionalForm.patchValue({
      bot: $event.checked
    });
  }

  async tryAuthentication(type: string) {
    const oauthHandler = new TwitchOAuthHandler(
      clientId, scopes, currentUrl, true
    );

    const result = await oauthHandler.login();

    if (type === 'main') {
      this.mainAccountForm.patchValue({
        authToken: result.accessToken,
      });
    } else {
      this.mainAccountForm.patchValue({
        botName: result.userName,
        botToken: result.accessToken,
      });
    }
  }

  deleteMainAuth () {
    this.mainAccountForm.patchValue({
      authToken: null
    });
  }

  deleteBotAuth () {
    this.mainAccountForm.patchValue({
      botName: null,
      botToken: null,
    });
  }
}
