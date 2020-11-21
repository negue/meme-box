import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Subject} from "rxjs";
import {filter, take} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {AppService} from "../../../../state/app.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";

@Component({
  selector: 'app-twitchbot-config',
  templateUrl: './twitchbot-config.component.html',
  styleUrls: ['./twitchbot-config.component.scss']
})
export class TwitchbotConfigComponent implements OnInit {

  public form = new FormBuilder().group({
    bot: false,
    botName: '',
    botToken: '',
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
    this.form.reset({
      bot: false,
      botName: '',
      botToken: '',
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitchChannel),
      take(1),
    ).subscribe(value => {
      this.form.reset({
        bot: value.twitch ? value.twitch.bot: false,
        botName: value.twitch ? value.twitch.botName : '',
        botToken: value.twitch ? value.twitch.botToken : ''
      });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async saveBotData() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
    await this.appService.updateTwitchBotData(this.form.value.bot, this.form.value.botName, this.form.value.botToken);
  }

  onCheckboxChangedBot($event: MatCheckboxChange, config: Partial<Config>) {
    this.form.value.bot = $event.checked;
    this.appService.updateTwitchBotData($event.checked, this.form.value.botName, this.form.value.botToken);
  }

}
