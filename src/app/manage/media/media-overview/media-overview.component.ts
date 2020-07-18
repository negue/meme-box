import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {take} from "rxjs/operators";
import {Clip} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {WS_PORT} from "../../../../../server/constants";
import {ScreenAssigningDialogComponent} from "./screen-assigning-dialog/screen-assigning-dialog/screen-assigning-dialog.component";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss']
})
export class MediaOverviewComponent implements OnInit {

  public mediaList$: Observable<Clip[]> = this.query.clipList$;

  private ws: WebSocket;

  constructor(public service: AppService,
              public query: AppQueries,
  private _dialog: MatDialog) { }

  ngOnInit(): void {

    this.ws = new WebSocket(`ws://localhost:${WS_PORT}`);
  }

  addNewItem() {
    this.showDialog({});
  }


  showDialog(clipInfo: Partial<Clip>) {
    this._dialog.open(
      MediaEditComponent, {
        data: clipInfo
      }
    )
  }

  onDelete(clipId: string) {
    this.service.deleteClip(clipId);
  }

  onEdit(item: Clip) {
    this.showDialog(item);
  }

  onPreview(item: Clip) {
    this.query.screens$
      .pipe(
        take(1)
      ).subscribe(obsUrls => {

      obsUrls.forEach(url => {
          if (url.clips[item.id]) {
            const triggerObj = {
              id: item.id,
              targetOBS: url.id,
              repeatX: 0,
              repeatSecond: 0,
            }

            this.ws.send(`TRIGGER_CLIP=${JSON.stringify(triggerObj)}`);
          }
        }
      )
    });
  }

  onAssignObs(item: Clip) {
    this._dialog.open(
      ScreenAssigningDialogComponent, {
        data: item
      }
    )
  }
}
