import {Component, OnInit} from '@angular/core';
import {AppQueries} from "../../state/app.queries";
import {AppService} from "../../state/app.service";
import {Observable} from "rxjs";
import {Clip} from "@memebox/contracts";
import {take} from "rxjs/operators";
import {WebsocketService} from "../../core/services/websocket.service";
import {SettingsService} from "../../core/services/settings.service";

const SettingMobileColumnSize = 'MOBILE_COLUMN_SIZE';

@Component({
  selector: 'app-mobile-clip-overview',
  templateUrl: './mobile-clip-overview.component.html',
  styleUrls: ['./mobile-clip-overview.component.scss']
})
export class MobileClipOverviewComponent implements OnInit {

  public currentColumnSize = 50;
  public clipList$: Observable<Clip[]> = this.appQueries.clipList$;

  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private _wsService: WebsocketService,
              private _settingsService: SettingsService) {
    const savedColumnSizeStringValue = this._settingsService.loadSetting(SettingMobileColumnSize, '50');

    // refactor later...
    this.currentColumnSize = +savedColumnSizeStringValue;
  }

  ngOnInit(): void {
    this.appService.loadState();
  }


  onPreview(item: Clip) {
    // ok for now, but needs to be refactored
    this.appQueries.screensList$
      .pipe(
        take(1)
      ).subscribe(screens => {

      screens.forEach(url => {
          if (url.clips[item.id]) {
            this._wsService.triggerClipOnScreen(item.id, url.id);
          }
        }
      )
    });
  }

  onColumnSizeChanged($event: number) {
    this.currentColumnSize = $event;
    this._settingsService.saveSetting(SettingMobileColumnSize, `${$event}`);
  }
}
