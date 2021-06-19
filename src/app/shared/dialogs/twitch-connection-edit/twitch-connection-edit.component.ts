import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Subject} from "rxjs";
import {AppQueries} from "../../../state/app.queries";
import {AppService} from "../../../state/app.service";
import {filter, take} from "rxjs/operators";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";
import {ConfigService} from "../../../state/config.service";
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

@Component({
  selector: 'app-twitch-connection-edit',
  templateUrl: './twitch-connection-edit.component.html',
  styleUrls: ['./twitch-connection-edit.component.scss']
})
export class TwitchConnectionEditComponent implements OnInit {
  @Input()
  public showAdvancedOptions = true;

  public mainAccountForm = new FormBuilder().group({
    channelName: '',
    authUserName: '',
    authToken: '',
    botName: '',
    botToken: '',
  });

  public additionalForm = new FormBuilder().group({
    bot: false,
    log: false,
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
      this.mainAccountForm.reset({
        channelName: value.twitch.channel,
        botName: value.twitch?.bot?.auth?.name ?? '',
        botToken: value.twitch?.bot?.auth?.token ?? '',
      });

      this.additionalForm.reset({
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

  toggleOrSave() {
    if (this.editMode) {
      this.save();
    } else {
      this.editMode = true;
    }
  }

  onCheckboxChanged($event: MatCheckboxChange, config: Partial<Config>) {
    // this.configService.updateTwitchLogs($event.checked);
  }


  onBotIntegrationChanged($event: MatCheckboxChange, config: Partial<Config>){
   //  this.configService.updateTwitchBotIntegration($event.checked);
  }

  async tryAuthentication(type: string) {
    const oauthHandler = new TwitchOAuthHandler(
      clientId, scopes, currentUrl, true
    );

    const result = await oauthHandler.login();

    if (type === 'main') {
      this.mainAccountForm.patchValue({
        authUserName: result.userName,
        authToken: result.accessToken,
      });
    } else {
      this.mainAccountForm.patchValue({
        botName: result.userName,
        botToken: result.accessToken,
      });
    }
  }
}
