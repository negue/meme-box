import {Component, OnInit} from '@angular/core';
import {Clip, Screen, ScreenViewEntry} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ClipAssigningDialogComponent} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {AppService, EXPRESS_BASE} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";

function createLocalOrProductionUrlBase() {
  const port = location.port;
  let urlBase = EXPRESS_BASE;

  if (port === '4200') {
    urlBase = location.host;
  }

  return urlBase;
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

  constructor(
    private _dialog: DialogService,
    private _queries: AppQueries,
    public service: AppService,
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
        data: screen.id
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
}
