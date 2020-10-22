import {Component, OnInit, TrackByFunction} from '@angular/core';
import {Clip, HasId, Screen, ScreenViewEntry} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppService, EXPRESS_BASE} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {WebsocketService} from "../../../core/services/websocket.service";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {
  ClipAssigningDialogComponent,
  ClipAssigningDialogOptions,
  ClipAssigningMode
} from "../../../shared/components/dialogs/clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";

function createLocalOrProductionUrlBase() {
  const port = location.port;
  let urlBase = EXPRESS_BASE;

  if (port === '4200') {
    urlBase = location.host;
  }

  return urlBase;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@Component({
  selector: 'app-screen-overview',
  templateUrl: './screen-overview.component.html',
  styleUrls: ['./screen-overview.component.scss']
})
export class ScreenOverviewComponent implements OnInit {

  public screenList: Observable<ScreenViewEntry[]> = this._queries.screensList$.pipe(
    map(stateUrlArray => stateUrlArray.map(screen => ({
      ...screen,
      url: `${createLocalOrProductionUrlBase()}/#/screen/${screen.id}`
    })))
  )

  public trackById: TrackByFunction<HasId> = (index, item) => {
    return item.id;
  }

  constructor(
    private _dialog: DialogService,
    private _queries: AppQueries,
    public service: AppService,
    private webSocket: WebsocketService,
    private snackbar: SnackbarService
  ) {
  }

  ngOnInit(): void {
  }

  showDialog(screen: Partial<Screen>) {
    this._dialog.showScreenEditDialog(screen)
  }

  addNewItem() {
    this.showDialog({});
  }

  async delete(obsInfo: ScreenViewEntry) {
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
    this._dialog.open(
      ClipAssigningDialogComponent, {
        data: {
          mode: ClipAssigningMode.Multiple,
          screenId: screen.id,

          dialogTitle: screen.name
        } as ClipAssigningDialogOptions,
        width: '800px',

        panelClass: 'max-height-dialog'
      }
    )
  }

  deleteAssigned(obsInfo: ScreenViewEntry, clipId: string) {
    this.service.deleteScreenClip(obsInfo.id, clipId);
  }

  onClipOptions(item: Clip, screen: Screen) {
    this._dialog.showScreenClipOptionsDialog({
      clipId: item.id,
      screenId: screen.id,
      name: item.name
    });
  }

  async onPreview(clipId: string, screen: ScreenViewEntry) {
    if (clipId) {
      this.webSocket.triggerClipOnScreen(clipId, screen.id);
    } else {
      for (const clipId of Object.keys(screen.clips)) {
        this.webSocket.triggerClipOnScreen(clipId, screen.id);
        await timeout(3500)
      }
    }

  }

  onReload(screen: ScreenViewEntry) {
    this.webSocket.triggerReloadScreen(screen.id);
    this.snackbar.normal(`Screen: ${screen.name} reloaded`);
  }
}
