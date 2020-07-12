import {Component, OnInit} from '@angular/core';
import {Clip} from "../../../../projects/contracts/src/lib/types";
import {AppService} from "../../state/app.service";
import {AppQueries} from "../../state/app.queries";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MediaEditComponent} from "./media-edit/media-edit.component";

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

    this.ws = new WebSocket('ws://localhost:4444');
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
    const triggerObj = {
      id: item.id,
      targetOBS: '',
      repeatX: 0,
      repeatSecond: 0,
    }

    this.ws.send(`TRIGGER_CLIP=${JSON.stringify(triggerObj)}`);
  }
}
