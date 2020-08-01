import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppQueries} from "../../state/app.queries";
import {AppService} from "../../state/app.service";
import {Observable, Subject} from "rxjs";
import {Clip} from "@memebox/contracts";
import {WebsocketService} from "../../core/services/websocket.service";
import {SettingsService} from "../../core/services/settings.service";
import {take, takeUntil} from "rxjs/operators";

const SettingMobileColumnSize = 'MOBILE_COLUMN_SIZE';

@Component({
  selector: 'app-mobile-clip-overview',
  templateUrl: './mobile-clip-overview.component.html',
  styleUrls: ['./mobile-clip-overview.component.scss']
})
export class MobileClipOverviewComponent implements OnInit, OnDestroy {

  public currentColumnSize = 50;
  public clipList$: Observable<Clip[]> = this.appQueries.clipList$;

  private _destroy$ = new Subject();

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

    this._wsService.onOpenConnection$.pipe(
      take(1)
    ).subscribe(value => {
      this._wsService.sendI_Am_OBS('1');
    })

    this._wsService.onUpdateData$.pipe(
      takeUntil(this._destroy$),
    ).subscribe(value => {
      this.appService.loadState();
    });
  }


  onPreview(item: Clip) {
    this._wsService.triggerClipOnScreen(item.id);
  }

  onColumnSizeChanged($event: number) {
    this.currentColumnSize = $event;
    this._settingsService.saveSetting(SettingMobileColumnSize, `${$event}`);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
