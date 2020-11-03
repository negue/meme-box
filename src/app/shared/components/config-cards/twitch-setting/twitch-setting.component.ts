import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Subject} from "rxjs";
import {filter, take} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {AppService} from "../../../../state/app.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";

@Component({
  selector: 'app-twitch-setting',
  templateUrl: './twitch-setting.component.html',
  styleUrls: ['./twitch-setting.component.scss']
})
export class TwitchSettingComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    name: ''
  });

  public editMode = false;

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService) {

  }

  ngOnInit(): void {
    this.form.reset({
      name: 'my-channel'
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.twitchChannel),
      take(1),
    ).subscribe(value => {
      this.form.reset({
        name: value.twitchChannel
      });
    });


  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    this.editMode = false;
    await this.appService.updateTwitchChannel(this.form.value.name);
  }

  toggleOrSave() {
    if (this.editMode) {
      this.save();
    } else {
      this.editMode = true;
    }
  }

  onCheckboxChanged($event: MatCheckboxChange, config: Partial<Config>) {
    this.appService.updateTwitchLogs($event.checked);
  }
}
