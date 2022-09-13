import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract, TwitchScopeSelectionPayload} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {TwitchScopeSelectionComponent} from "./twitch-scope-selection.component";
import {MatButtonModule} from "@angular/material/button";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    TwitchScopeSelectionComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    OpenFeedbackButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  providers: [],
})
export class TwitchScopeSelectionDialogModule implements DialogContract<TwitchScopeSelectionPayload, TwitchScopeSelectionComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: TwitchScopeSelectionPayload): MatDialogRef<TwitchScopeSelectionComponent> {
    const dialogRef = this.dialog.open(TwitchScopeSelectionComponent, {
      data: payload,
      autoFocus: false,
      width: 'calc(min(700px, 96%))',
      maxWidth: '96vw'
    });

    return dialogRef;
  }
}
