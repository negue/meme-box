import {Component, OnInit} from '@angular/core';
import {Screen, ScreenViewEntry} from "@memebox/contracts";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ClipAssigningDialogComponent} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {AppService, EXPRESS_BASE} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";
import {
  ConfirmationsPayload,
  SimpleConfirmationDialogComponent
} from "../../../shared/components/simple-confirmation-dialog/simple-confirmation-dialog.component";

@Component({
  selector: 'app-screen-overview',
  templateUrl: './screen-overview.component.html',
  styleUrls: ['./screen-overview.component.scss']
})
export class ScreenOverviewComponent implements OnInit {

  public obsList$: Observable<ScreenViewEntry[]> = this._queries.screensList$.pipe(
    map(stateUrlArray => stateUrlArray.map(obsUrl => ({
      ...obsUrl,
      url: `${EXPRESS_BASE}/#/screen/${obsUrl.id}`
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

      const dialogRef = this._dialog.open(SimpleConfirmationDialogComponent, {
        data: {
          title: 'Are you sure you want to delete this screen?'
        } as ConfirmationsPayload
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.service.deleteScreen(obsInfo.id);
        }
      });
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
