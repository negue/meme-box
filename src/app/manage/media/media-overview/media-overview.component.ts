import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {Clip, Screen, Tag} from '@memebox/contracts';
import {AppQueries, AppService, WebsocketService} from '@memebox/app-state';
import {DialogService} from '../../../shared/dialogs/dialog.service';
import {IFilterItem} from '../../../shared/components/filter/filter.component';
import {createCombinedFilterItems$, filterClips$} from '../../../shared/components/filter/filter.methods';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {OverviewUiMode, OverviewUiService} from './overview-ui.service';
import isEqual from 'lodash/isEqual';
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {ActionTypeGroup} from "./group-by-media-type.pipe";
import {savedBehaviorSubject} from "@memebox/utils";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaOverviewComponent implements OnInit, OnDestroy{
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


  public dontHaveActions$ = this.query.clipList$.pipe(
    map((availableClips) => {
      return availableClips.length === 0;
    })
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

  public trackByGroup: TrackByFunction<ActionTypeGroup> = (index, item) => {
    return item.mediaType;
  }

  private destroy$ = new Subject<void>();

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private _wsService: WebsocketService,
              private _uiService: OverviewUiService,
              private configService: ConfigService,) {
    savedBehaviorSubject('mediaOverviewFilter', this.filteredItems$, this.destroy$);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  openHelpOverview() {
    this._dialog.showHelpOverview();
  }

  toggleViewModes() {
    this._uiService.toggleCurrentUiMode();
  }

  onDuplicate(itemId: string) {
    this.service.duplicateAction(itemId);
  }

  addNewActionByType(mediGroup: ActionTypeGroup) {

    this._dialog.showMediaEditDialog({
      actionToEdit: null,
      defaults: {
        type: mediGroup.mediaType
      }
    });
  }
}
