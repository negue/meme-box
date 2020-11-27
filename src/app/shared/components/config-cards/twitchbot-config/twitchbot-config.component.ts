import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Subject} from "rxjs";
import {filter, take} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {AppService} from "../../../../state/app.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";
import { TwitchBotConfig } from '../../../../../../projects/contracts/src/lib/types';

@Component({
  selector: 'app-twitchbot-config',
  templateUrl: './twitchbot-config.component.html',
  styleUrls: ['./twitchbot-config.component.scss']
})
export class TwitchbotConfigComponent implements OnInit {

  private botIntegrationEnabled = false;
  public commandsFlagMessage = '{{commands}}'
  public userFlagMessage = '{{user}}'

  public form = new FormBuilder().group({
    bot: false,
    botName: '',
    botToken: '',
    botResponse: ''
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
    this.form.reset({
      botName: '',
      botToken: '',
      botResponse: ''
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitchChannel),
      take(1),
    ).subscribe(value => {
      this.form.reset({
        botName: value.twitch ? value.twitch.botName : '',
        botToken: value.twitch ? value.twitch.botToken : '',
        botResponse: value.twitch ? value.twitch.botResponse : '',
      });
      this.botIntegrationEnabled = value.twitch.bot
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async saveBotData(): Promise<void> {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const twitchBot : TwitchBotConfig = {
      bot: this.botIntegrationEnabled,
      botName: this.form.value.botName,
      botToken: this.form.value.botToken,
      botResponse: this.form.value.botResponse
    }

    await this.appService.updateTwitchBotData(twitchBot);
  }
}
