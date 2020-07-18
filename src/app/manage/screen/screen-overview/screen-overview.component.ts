import {Component, OnInit} from '@angular/core';
import {Screen, ScreenViewEntry} from "@memebox/contracts";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ClipAssigningDialogComponent} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {AppService, EXPRESS_BASE} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";

@Component({
  selector: 'app-screen-overview',
  templateUrl: './screen-overview.component.html',
  styleUrls: ['./screen-overview.component.scss']
})
export class ScreenOverviewComponent implements OnInit {

  public obsList$: Observable<ScreenViewEntry[]> = this._queries.screens$.pipe(
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

  showDialog(obsInfo: Partial<Screen>) {
    this._dialog.open(
      ScreenEditComponent, {
        data: obsInfo
      }
    )
  }

  addNewItem() {
    this.showDialog({});
  }

  delete(obsInfo: ScreenViewEntry) {
    console.info({obsInfo});
    this.service.deleteScreen(obsInfo.id);
  }

  showAssignmentDialog(obsInfo: Partial<Screen>) {
    this._dialog.open(
      ClipAssigningDialogComponent, {
        data: obsInfo
      }
    )
  }

  deleteAssigned(obsInfo: ScreenViewEntry, clipId: string) {
    this.service.deleteScreenClip(obsInfo.id, clipId);
  }
}
