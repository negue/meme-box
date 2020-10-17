import {Component, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {Clip, HasId, Screen} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {WebsocketService} from "../../../core/services/websocket.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {IFilterItem} from "../../../shared/components/filter/filter.component";
import {createCombinedFilterItems$, filterClips$} from "../../../shared/components/filter/filter.methods";
import {map} from "rxjs/internal/operators";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss']
})
export class MediaOverviewComponent implements OnInit {

  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public mediaList$: Observable<Clip[]> = filterClips$(
    this.query.clipList$,
    this.filteredItems$
  );

  public screenList$: Observable<Screen[]> = this.query.screensList$;

  public filterItems$: Observable<IFilterItem[]> = createCombinedFilterItems$(
    this.query.clipList$,
    this.query.tagMap$
  );

  public showGettingStarted$ = combineLatest([
    this.query.clipList$,
    this.screenList$
  ]).pipe(
    map(([availableClips, availableScreens]) => {
      return availableClips.length === 0 || availableScreens.length === 0;
    })
  );

  public trackById: TrackByFunction<HasId> = (index, item) => {
    return item.id;
  }

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private _wsService: WebsocketService) {
  }

  ngOnInit(): void {
  }

  addNewItem(): any {
    this.showDialog(null);
  }


  showDialog(clipInfo: Partial<Clip>): void {
    this._dialog.showMediaEditDialog(clipInfo);
  }

  async onDelete(clipId: string) {
    const result = await this._dialog.showConfirmationDialog({
      title: 'Are you sure you want to delete this clip?',
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
}
