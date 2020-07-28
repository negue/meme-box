import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {Clip} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {ScreenAssigningDialogComponent} from "./screen-assigning-dialog/screen-assigning-dialog/screen-assigning-dialog.component";
import {WebsocketService} from "../../../core/services/websocket.service";
import {
  ConfirmationsPayload,
  SimpleConfirmationDialogComponent
} from "../../../shared/components/simple-confirmation-dialog/simple-confirmation-dialog.component";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss']
})
export class MediaOverviewComponent implements OnInit {

  public mediaList$: Observable<Clip[]> = this.query.clipList$;


  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: MatDialog,
              private _wsService: WebsocketService) { }

  ngOnInit(): void {

  }

  addNewItem() {
    this.showDialog(null);
  }


  showDialog(clipInfo: Partial<Clip>) {
    this._dialog.open(
      MediaEditComponent, {
        data: clipInfo
      }
    )
  }

  onDelete(clipId: string) {
    const dialogRef = this._dialog.open(SimpleConfirmationDialogComponent, {
      data: {
        title: 'Are you sure you want to delete this clip?',
      } as ConfirmationsPayload
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.deleteClip(clipId);
      }
    });

  }

  onEdit(item: Clip) {
    this.showDialog(item);
  }

  onPreview(item: Clip) {
    this._wsService.triggerClipOnScreen(item.id);
  }

  onAssignObs(item: Clip) {
    this._dialog.open(
      ScreenAssigningDialogComponent, {
        data: item
      }
    )
  }
}
