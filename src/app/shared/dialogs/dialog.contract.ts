import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {DynamicIframeContent, ScriptConfig} from "@memebox/utils";
import {ActionType} from "@memebox/contracts";

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
  actionType: ActionType; // TODO Rename once the "Actions" are the right choice of words
}

export interface TwitchScopeSelectionResult {
  defaultScopes: string[];
  custom: string[];
}

export interface TwitchScopeSelectionPayload {
  scopes: string[];
}
