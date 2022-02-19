import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Subject} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {AppQueries, AppService} from '@memebox/app-state';
import {DEFAULT_PORT} from "../../../../../../server/constants";
import {ConfigService} from "../../../../../../projects/app-state/src/lib/services/config.service";

@Component({
  selector: 'app-custom-port-setting',
  templateUrl: './custom-port-setting.component.html',
  styleUrls: ['./custom-port-setting.component.scss']
})
export class CustomPortSettingComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    port: ''
  });

  public editMode = false;

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService) {

  }

  ngOnInit(): void {
    this.form.reset({
      port: DEFAULT_PORT
    });

    this.appQuery.config$.pipe(
      filter(config => !!config.customPort),
      take(1),
    ).subscribe(value => {
      this.form.reset({
        port: value.customPort
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
    await this.configService.updateCustomPort(this.form.value.port);
  }

  toggleOrSave() {
    if (this.editMode) {
      this.save();
    } else {
      this.editMode = true;
    }
  }
}
