import {Component, TrackByFunction} from '@angular/core';
import {Action, ClipAssigningMode, HasId, Screen, UnassignedFilterEnum} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map, take} from "rxjs/operators";
import {ActivityQueries, AppQueries, AppService, MemeboxWebsocketService, SnackbarService} from "@memebox/app-state";
import {DialogService} from "../../../shared/dialogs/dialog.service";
import orderBy from 'lodash/orderBy';
import {ScreenUrlDialogComponent} from "./screen-url-dialog/screen-url-dialog.component";

// todo use @gewd npm package
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@Component({
  selector: 'app-screen-overview',
  templateUrl: './screen-overview.component.html',
  styleUrls: ['./screen-overview.component.scss']
})
export class ScreenOverviewComponent {

  public screenList$: Observable<Screen[]> = this._queries.screensList$.pipe(
    map(stateUrlArray => orderBy(stateUrlArray, 'name'))
  )

  public trackById: TrackByFunction<HasId> = (index, item) => {
    return item.id;
  }

  constructor(
    private _dialog: DialogService,
    private _queries: AppQueries,
    public service: AppService,
    public activityState: ActivityQueries,
    private webSocket: MemeboxWebsocketService,
    private snackbar: SnackbarService
  ) {
  }

  showDialog(screen: Partial<Screen>) {
    this._dialog.showScreenEditDialog(screen)
  }

  addNewItem() {
    this.showDialog({});
  }

  async delete(obsInfo: Screen) {
    const confirmationResult = await this._dialog.showConfirmationDialog(
      {
        title: 'Are you sure you want to delete this screen?'
      }
    )

    if (confirmationResult) {
      this.service.deleteScreen(obsInfo.id);
    }
  }

  showAssignmentDialog(screen: Partial<Screen>) {
    return this._dialog.showClipSelectionDialog({
      mode: ClipAssigningMode.Multiple,
      screenId: screen.id,

      dialogTitle: screen.name,
      showMetaItems: false,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Screens
    });
  }

  deleteAssigned(obsInfo: Screen, clipId: string) {
    this.service.deleteScreenClip(obsInfo.id, clipId);
  }

  onClipOptions(item: Action, screen: Screen) {
    this._dialog.showScreenClipOptionsDialog({
      clipId: item.id,
      screenId: screen.id,
      name: item.name
    });
  }

  async onPreview(clipId: string, screen: Screen) {
    if (clipId) {
      this.webSocket.triggerClipOnScreen(clipId, screen.id);
    } else {
      for (const clipId of Object.keys(screen.clips)) {
        this.webSocket.triggerClipOnScreen(clipId, screen.id);
        await timeout(3500)
      }
    }

  }

  onReload(screen: Screen) {
    this.webSocket.triggerReloadScreen(screen.id);
    this.snackbar.normal(`Screen: ${screen.name} reloaded`);
  }

  openHelpOverview() {
    this._dialog.showHelpOverview();
  }

  onGetUrl(screen: Screen) {
    this._dialog.open(ScreenUrlDialogComponent,{
      autoFocus: false,
      data: screen,
      maxWidth: '96vw',
      minHeight: '50vh'
    });
  }

  async onOpenArrangeDialog(screen: Screen) {
    if (Object.values(screen.clips).length === 0) {
      await this.showAssignmentDialog(screen);

      screen = await this._queries.screenMap$.pipe(
        map(screens => screens[screen.id]),
        take(1)
      ).toPromise();

      if (Object.values(screen.clips).length === 0) {
        return;
      }
    }

    this._dialog.arrangeMediaInScreen(screen);
  }
}
