import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {DynamicIframeContent, ScriptConfig} from "@memebox/utils";

export interface DialogContract<TPayload> {
  openDialog(payload: TPayload): MatDialogRef<any>;
}

export interface DialogData<TPayload> {
  data: TPayload;
}

export interface CustomHtmlDialogPayload {
  mediaId: string;
  name: string;
  iframePayload: DynamicIframeContent;
}

export interface CustomScriptDialogPayload {
  mediaId: string;
  name: string;
  scriptConfig: ScriptConfig;
}
