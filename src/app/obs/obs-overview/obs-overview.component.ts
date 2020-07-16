import {Component, OnInit} from '@angular/core';
import {ObsURL, ObsViewEntry} from "@memebox/contracts";
import {MatDialog} from "@angular/material/dialog";
import {ObsEditComponent} from "./obs-edit/obs-edit.component";
import {Observable} from "rxjs";
import {AppQueries} from "../../state/app.queries";
import {map} from "rxjs/operators";
import {AppService, EXPRESS_BASE} from "../../state/app.service";
import {ClipAssigningDialogComponent} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";

@Component({
  selector: 'app-obs-overview',
  templateUrl: './obs-overview.component.html',
  styleUrls: ['./obs-overview.component.scss']
})
export class ObsOverviewComponent implements OnInit {

  public obsList$: Observable<ObsViewEntry[]> = this._queries.obsUrls$.pipe(
    map(stateUrlArray => stateUrlArray.map(obsUrl => ({
      ...obsUrl,
      url: `${EXPRESS_BASE}/#/obs/${obsUrl.id}`
    })))
  )

  constructor(
    private _dialog: MatDialog,
  private _queries: AppQueries,
    public service: AppService,
  ) { }

  ngOnInit(): void {
  }

  showDialog(obsInfo: Partial<ObsURL>) {
    this._dialog.open(
      ObsEditComponent, {
        data: obsInfo
      }
    )
  }

  addNewItem() {
    this.showDialog({});
  }

  delete(obsInfo: ObsViewEntry) {
    console.info({obsInfo});
    this.service.deleteObsUrl(obsInfo.id);
  }

  showAssignmentDialog(obsInfo: Partial<ObsURL>) {
    this._dialog.open(
      ClipAssigningDialogComponent, {
        data: obsInfo
      }
    )
  }

  deleteAssigned(obsInfo: ObsViewEntry, clipId: string) {
    this.service.deleteObsClipByClipId(obsInfo.id, clipId);
  }
}
