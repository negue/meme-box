import {MatDialogRef} from "@angular/material/dialog/dialog-ref";

export interface DialogContract<TPayload> {
  openDialog(payload: TPayload): MatDialogRef<any>;
}
