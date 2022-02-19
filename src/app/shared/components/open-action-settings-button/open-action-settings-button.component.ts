import {Component, Input} from '@angular/core';
import {Action} from "@memebox/contracts";
import {DialogService} from "../../dialogs/dialog.service";

@Component({
  selector: 'app-open-action-settings-button',
  templateUrl: './open-action-settings-button.component.html',
  styleUrls: ['./open-action-settings-button.component.scss']
})
export class OpenActionSettingsButtonComponent  {

  @Input()
  public action: Action;

  constructor(
    private dialogService: DialogService
  ) { }

  openActionSetting(): void {
    this.dialogService.showMediaEditDialog({
      actionToEdit: this.action
    });
  }
}
