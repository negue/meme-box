import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {DynamicIframeContent} from "@memebox/utils";

export interface DialogContract<TPayload> {
  openDialog(payload: TPayload): MatDialogRef<any>;
}

export interface CustomHtmlDialogPayload {
  name: string;
  iframePayload: DynamicIframeContent;
}
