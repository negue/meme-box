import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AppQueries } from '../../../../state/app.queries';
import { AppService } from '../../../../state/app.service';
import { TwitchBotConfig, TwitchConfig } from '@memebox/contracts';

@Component({
  selector: 'app-twitchbot-config',
  templateUrl: './twitchbot-config.component.html',
  styleUrls: ['./twitchbot-config.component.scss']
})
export class TwitchbotConfigComponent implements OnInit {

  private botIntegrationEnabled = false;
  public commandsFlagMessage = '{{commands}}';
  public userFlagMessage = '{{user}}';

  public form = new FormBuilder().group({
    bot: false,
    botName: '',
    botToken: '',
    botResponse: ''
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
    this.form.reset({
      botName: '',
      botToken: '',
      botResponse: ''
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitch),
      take(1)
    ).subscribe(value => {
      this.form.reset({
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

  saveBotData(): Promise<void> {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const twitchBot: TwitchConfig = {
      channel: '',
      bot:{
        response: this.form.value.botResponse,
        enabled: this.botIntegrationEnabled,
        auth: {
          name: this.form.value.botName,
          token: this.form.value.botToken
        }
      }
    };

    this.appService.updateTwitchBotData(twitchBot);
  }
}
