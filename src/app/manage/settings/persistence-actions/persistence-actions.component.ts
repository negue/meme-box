import {Component, OnInit} from '@angular/core';
import {WebsocketService} from "../../../core/services/websocket.service";
import {AppService} from "../../../state/app.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {ImportMediaFilesDialogComponent} from "./import-media-files-dialog/import-media-files-dialog.component";

@Component({
  selector: 'app-persistence-actions',
  templateUrl: './persistence-actions.component.html',
  styleUrls: ['./persistence-actions.component.scss']
})
export class PersistenceActionsComponent implements OnInit {

  constructor(private wsService: WebsocketService,
              private appService: AppService,
              private dialog: DialogService) { }

  ngOnInit(): void {

  }

  async deleteAllConfig() {
   const confirmed = await this.dialog.showConfirmationDialog({
      title: 'Are you sure you want to delete all settings?'
    })

    if (confirmed) {
      this.appService.deleteAll();
    }
  }

  importAll() {
    this.dialog.open(ImportMediaFilesDialogComponent);
  }
}
