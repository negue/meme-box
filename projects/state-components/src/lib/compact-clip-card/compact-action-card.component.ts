import {Component, Input} from '@angular/core';
import {Action} from "@memebox/contracts";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";

@Component({
  selector: 'app-compact-action-card',
  templateUrl: './compact-action-card.component.html',
  styleUrls: ['./compact-action-card.component.scss']
})
export class CompactActionCardComponent {

  @Input()
  public action: Action;

  @Input()
  public showEditIcon = true

  constructor(
    private dialogService: DialogService
  ) { }

  openActionSetting(): void {
    this.dialogService.showMediaEditDialog({
      actionToEdit: this.action
    });
  }
}
