import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@ngneat/reactive-forms';
import {Subject} from "rxjs";
import {AppQueries, AppService} from "@memebox/app-state";
import {filter, take} from "rxjs/operators";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {
  Config,
  DEFAULT_TWITCH_SCOPES,
  TWITCH_BOT_RESPONSE_CONSTS,
  TWITCH_CLIENT_ID,
  TwitchAuthInformation
} from "@memebox/contracts";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {TwitchOAuthHandler} from "./twitch.oauth";
import {MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../dialog.service";

const currentUrl = `${location.origin}`;
const isValidTwitchAuthUrl = ['localhost:4200', 'localhost:6363'].some(url => currentUrl.includes(url));

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
  command: string;
}

@Component({
  selector: 'app-twitch-connection-edit',
  templateUrl: './twitch-connection-edit.component.html',
  styleUrls: ['./twitch-connection-edit.component.scss']
})
export class TwitchConnectionEditComponent implements OnInit {
  private _destroy$ = new Subject();

  private _customScopes: string[] = [];

  public mainAccountForm = new FormBuilder().group<MainAccountForm>({
    channelName: '',
    authToken: '',
    botName: '',
    botToken: '',
  });

  public additionalForm = new FormBuilder().group<AdditionalForm>({
    bot: false,
    log: false,
    botResponse: '',
    command: ''
  });

  public config$ = this.appQuery.config$;
  public mainAuthInformation: TwitchAuthInformation | undefined;
  public botAuthInformation: TwitchAuthInformation | undefined;

  public commandsFlagMessage = TWITCH_BOT_RESPONSE_CONSTS.COMMANDS;
  public userFlagMessage = TWITCH_BOT_RESPONSE_CONSTS.USER;
  public defaultCommandsResponse = TWITCH_BOT_RESPONSE_CONSTS.DEFAULT_COMMANDS_TEXT;


  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService,
              private dialogService: DialogService,
              private dialogRef: MatDialogRef<any>,) {

  }

  async ngOnInit(): Promise<void> {
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
        authToken: value.twitch.token,
        botName: value.twitch?.bot?.auth?.name ?? '',
        botToken: value.twitch?.bot?.auth?.token ?? '',
      });

      this.additionalForm.reset({
        botResponse: value.twitch?.bot?.response || TWITCH_BOT_RESPONSE_CONSTS.DEFAULT_COMMANDS_TEXT,
        bot: value.twitch.bot.enabled,
        command: value.twitch.bot.command || TWITCH_BOT_RESPONSE_CONSTS.DEFAULT_TRIGGER,
        log: value.twitch.enableLog
      });

      this._customScopes = value.twitch.customScopes ?? [];
    });

    const authInformations = await this.configService.loadTwitchAuthInformations();

    this.mainAuthInformation = authInformations?.find(a => a.type === 'main');
    this.botAuthInformation = authInformations?.find(a => a.type === 'bot');
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
      customScopes: this._customScopes,
      enableLog: botValues.log,
      bot: {
        enabled: botValues.bot,
        command: botValues.command,
        response: botValues.botResponse,
        auth: {
          name: mainAccountValues.botName,
          token: mainAccountValues.botToken
        }
      }
    });

    this.dialogRef.close();
  }

  onCheckboxChanged($event: MatCheckboxChange, config: Partial<Config>): void {
    this.additionalForm.patchValue({
      log: $event.checked
    });
  }


  onBotIntegrationChanged($event: MatCheckboxChange, config: Partial<Config>): void{
    this.additionalForm.patchValue({
      bot: $event.checked
    });
  }

  async tryAuthentication(type: string, withCustomScope = false) {
    if (withCustomScope) {
      const newScopes = await this.dialogService.openTwitchScopeSelection({
        scopes: this._customScopes
      });

      if (!newScopes) {
        return;
      }

      this._customScopes = newScopes.custom;
    }

    if (!isValidTwitchAuthUrl) {
      this.dialogService.showConfirmationDialog({
        content: 'Twitch Auth can be only done on the normal memebox Port (6363)',
        title: 'Start Memebox without the custom Port.',
        overrideButtons: true,
        noButton: '',
        yesButton: 'OK'
      });
      return;
    }

    const continueToAuth = await this.dialogService.showConfirmationDialog({
      content: `This Auth-Process opens a Window which could leak your newly created Token.

      Here is how you can pixelate your OBS screen:

      https://www.lucecarter.co.uk/blog/how-to-achieve-a-pixellated-secrets-scene-in-obs-for-windows`,
      title: 'If you are streaming RIGHT NOW, hide your screen.',
      overrideButtons: true,
      noButton: 'Abort',
      yesButton: "Ok, I've hidden the screen."
    });

    if (!continueToAuth) {
      return;
    }

    const scopesForThisToken = [...DEFAULT_TWITCH_SCOPES];
    if (withCustomScope) {
      scopesForThisToken.push(...this._customScopes);
    }

    const oauthHandler = new TwitchOAuthHandler(
      TWITCH_CLIENT_ID, scopesForThisToken.join('+'), currentUrl, true
    );

    const result = await oauthHandler.login();

    if (type === 'main') {
      if (!this.mainAccountForm.value.channelName) {
        this.mainAccountForm.patchValue({
          channelName: result.userName,
        });
      }

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

  async deleteMainAuth (): Promise<void> {
    await this.configService.revokeToken('MAIN');

    this.mainAccountForm.patchValue({
      authToken: null
    });

    this.mainAuthInformation = null;
  }

  async deleteBotAuth (): Promise<void> {
    await this.configService.revokeToken('BOT');

    this.mainAccountForm.patchValue({
      botName: null,
      botToken: null,
    });

    this.botAuthInformation = null;
  }
}
