import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Clip, Config, Screen} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {ScreenAssigningDialogComponent} from "./screen-assigning-dialog/screen-assigning-dialog/screen-assigning-dialog.component";
import {WebsocketService} from "../../../core/services/websocket.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {ConfigMediaPathComponent} from "./config-media-path/config-media-path.component";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss']
})
export class MediaOverviewComponent implements OnInit {

  public mediaList$: Observable<Clip[]> = this.query.clipList$;
  public config$: Observable<Partial<Config>> = this.query.config$;

  public screenList$: Observable<Screen[]> = this.query.screensList$

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private _wsService: WebsocketService) { }

  ngOnInit(): void {

  }

  addNewItem() {
    this.showDialog(null);
  }


  showDialog(clipInfo: Partial<Clip>) {
    this._dialog.showMediaEditDialog(clipInfo);
  }

  async onDelete(clipId: string) {
    const result = await this._dialog.showConfirmationDialog({
      title: 'Are you sure you want to delete this clip?',
    });

    if (result) {
      this.service.deleteClip(clipId);
    }
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

  onClipOptions(item: Clip, screen: Screen) {
    this._dialog.showScreenClipOptionsDialog({
      clipId: item.id,
      screenId: screen.id
    });
  }

  openMediaFolderDialog() {
    this._dialog.open(ConfigMediaPathComponent, {
      data: {}
    });
  }

  openMediaFolderExplorer() {
    this.service.openMediaFolder();
  }
}
