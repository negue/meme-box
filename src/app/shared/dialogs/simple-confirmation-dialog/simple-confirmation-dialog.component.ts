import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

export interface ConfirmationsPayload {
  title: string;
  content?: string;

  overrideButtons?: boolean;
  yesButton?: string;
  noButton?: string;

  escapeToAbortNotAllowed?: boolean;
}

@Component({
  selector: 'app-simple-confirmation-dialog',
  templateUrl: './simple-confirmation-dialog.component.html',
  styleUrls: ['./simple-confirmation-dialog.component.css']
})
export class SimpleConfirmationDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationsPayload) {
   data.content = data.content?.trim() ?? '';

    if (!data.overrideButtons) {
      data.yesButton = 'Yes';
      data.noButton = 'No';
    }
  }
}
