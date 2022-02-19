import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@ngneat/reactive-forms';
import {Subject} from "rxjs";
import {AppQueries, AppService} from "@memebox/app-state";
import {filter, take} from "rxjs/operators";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";

interface ObsConnectionForm {
  hostname: string;
  password: string;
}


@Component({
  selector: 'app-obs-connection-edit',
  templateUrl: './obs-connection-edit.component.html',
  styleUrls: ['./obs-connection-edit.component.scss']
})
export class ObsConnectionEditComponent implements OnInit {
  public obsForm = new FormBuilder().group<ObsConnectionForm>({
    hostname: '',
    password: '',
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService,) {

  }

  ngOnInit(): void {
    this.appQuery.config$.pipe(
      filter(config => !!config.twitch),
      take(1),
    ).subscribe(value => {
      console.info({ value });

      this.obsForm.reset({
        hostname: value.obs?.hostname,
        password: value.obs?.password,
      });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async save() {
    if (!this.obsForm.valid) {
      // highlight hack
      this.obsForm.markAllAsTouched();

      return;
    }

    const obsValues = this.obsForm.value;

    await this.configService.updateObsConfig({
      hostname: obsValues.hostname,
      password: obsValues.password
    });
  }
}
