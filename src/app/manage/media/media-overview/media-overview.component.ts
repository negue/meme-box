import {ChangeDetectionStrategy, Component, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Clip, Screen, Tag} from '@memebox/contracts';
import {AppService} from '../../../../../projects/app-state/src/lib/state/app.service';
import {AppQueries} from '../../../../../projects/app-state/src/lib/state/app.queries';
import {WebsocketService} from '../../../../../projects/app-state/src/lib/services/websocket.service';
import {DialogService} from '../../../shared/dialogs/dialog.service';
import {IFilterItem} from '../../../shared/components/filter/filter.component';
import {createCombinedFilterItems$, filterClips$} from '../../../shared/components/filter/filter.methods';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {OverviewUiMode, OverviewUiService} from './overview-ui.service';
import isEqual from 'lodash/isEqual';
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {MediGroup} from "./group-by-media-type.pipe";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaOverviewComponent implements OnInit {
  public uiMode$ = this._uiService.getCurrentUiMode$().pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  public OVERVIEW_MODES = OverviewUiMode;

  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public mediaList$: Observable<Clip[]> = filterClips$(
    this.query.state$,
    this.filteredItems$
  ).pipe(
    distinctUntilChanged((pre, now) => isEqual(pre, now))
  );

  public screenList$: Observable<Screen[]> = this.query.screensList$;

  public tagList$: Observable<Tag[]> = this.query.tagList$;
  public inOfflineMode$: Observable<boolean> = this.query.inOfflineMode$;

  public filterItems$: Observable<IFilterItem[]> = createCombinedFilterItems$(
    this.query.state$,
    true
  );

  public showGettingStarted$ = combineLatest([
    this.query.clipList$,
    this.screenList$
  ]).pipe(
    map(([availableClips, availableScreens]) => {
      return availableClips.length === 0 || availableScreens.length === 0;
    })
  );

  public trackById: TrackByFunction<Clip> = (index, item) => {
    return item.id;
  };

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private _wsService: WebsocketService,
              private _uiService: OverviewUiService,
              private configService: ConfigService,) {
  }

  ngOnInit(): void {
  }

  addNewItem(): any {
    this.showDialog(null);
  }

  fillWithDummyData() {
    this.configService.fillDummyData();
  }

  showDialog(clipInfo: Partial<Clip>): void {
    this._dialog.showMediaEditDialog({
      actionToEdit: clipInfo
    });
  }

  async onDelete(clipId: string) {
    const result = await this._dialog.showConfirmationDialog({
      title: 'Are you sure you want to delete this clip?'
    });

    if (result) {
      await this.service.deleteClip(clipId);
    }
  }

  onEdit(item: Clip): void {
    this.showDialog(item);
  }

  onPreview(item: Clip): void {
    this._wsService.triggerClipOnScreen(item.id);
  }

  //TODO - the name and other information should come from the state
  onClipOptions(item: Clip, screen: Screen): void {
    this._dialog.showScreenClipOptionsDialog({
      clipId: item.id,
      screenId: screen.id,
      name: item.name
    });
  }

  onToggleMobileShow(item: Clip) {
    const newClip = {
      ...item,
      showOnMobile: !item.showOnMobile
    } as Clip;

    this.service.addOrUpdateClip(newClip);
  }

  onToggleTwitchEvent(item: Clip, twitchId: string) {
    this.service.toggleTwitchActiveState(twitchId);
  }

  openHelpOverview() {
    this._dialog.showHelpOverview();
  }

  toggleViewModes() {
    this._uiService.toggleCurrentUiMode();
  }

  onDuplicate(itemId: string) {
    this.service.duplicateAction(itemId);
  }

  addNewActionByType(mediGroup: MediGroup) {

    this._dialog.showMediaEditDialog({
      actionToEdit: null,
      defaults: {
        type: mediGroup.mediaType
      }
    });
  }
}
