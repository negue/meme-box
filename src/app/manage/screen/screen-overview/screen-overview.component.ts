import {Component, TrackByFunction} from '@angular/core';
import {Action, HasId, Screen} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map, take} from "rxjs/operators";
import {
  ActivityQueries,
  AppQueries,
  AppService,
  MemeboxWebsocketService,
  ObsService,
  SnackbarService
} from "@memebox/app-state";
import {DialogService} from "../../../shared/dialogs/dialog.service";
import orderBy from 'lodash/orderBy';
import {ScreenUrlDialogComponent} from "./screen-url-dialog/screen-url-dialog.component";
import {ScreenActionAssignmentService} from "../../../shared/screenActionAssignment.service";

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
    private _dialogService: DialogService,
    private _screenAssignmentService: ScreenActionAssignmentService,
    private _queries: AppQueries,
    public service: AppService,
    public activityState: ActivityQueries,
    private webSocket: MemeboxWebsocketService,
    private snackbar: SnackbarService,
    private memeboxObsApi: ObsService,
  ) {
  }

  showDialog(screen: Partial<Screen>): void  {
    this._dialogService.showScreenEditDialog(screen)
  }

  addNewItem(): void  {
    this.showDialog({});
  }

  async delete(obsInfo: Screen) {
    const confirmationResult = await this._dialogService.showConfirmationDialog(
      {
        title: 'Are you sure you want to delete this screen?'
      }
    )

    if (confirmationResult) {
      this.service.deleteScreen(obsInfo.id);
    }
  }

  showAssignmentDialog(screen: Partial<Screen>) {
    return this._screenAssignmentService.showAssignmentDialog(screen);
  }

  deleteAssigned(obsInfo: Screen, clipId: string): void  {
    this.service.deleteScreenMedia(obsInfo.id, clipId);
  }

  onClipOptions(item: Action, screen: Screen): void  {
    this._dialogService.showScreenClipOptionsDialog({
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

  onReload(screen: Screen): void  {
    this.memeboxObsApi.triggerReloadScreen(screen.id);
    this.snackbar.normal(`Screen: ${screen.name} reloaded`);
  }

  openHelpOverview(): void  {
    this._dialogService.showHelpOverview();
  }

  onGetUrl(screen: Screen): void  {
    this._dialogService.open(ScreenUrlDialogComponent,{
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

    this._dialogService.arrangeMediaInScreen(screen);
  }
}
