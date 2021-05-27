import {NgModule} from "@angular/core";
import {MediaEditComponent} from "./media-edit.component";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Clip} from "@memebox/contracts";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from "@angular/material/slider";
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {CompactClipCardModule} from "../../components/compact-clip-card/compact-clip-card.module";
import {DynamicIframeModule} from "../../components/dynamic-iframe/dynamic-iframe.module";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {ClipPreviewModule} from "../../components/clip-preview/clip-preview.module";
import {WidgetVariableInputModule} from "../../components/dynamic-variable-input/widget-variable-input.module";
import {TranslocoModule} from "@ngneat/transloco";
import {MatExpansionModule} from "@angular/material/expansion";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {ScriptVariableInputModule} from "../../components/script-variable-input/script-variable-input.module";

@NgModule({
  declarations: [
    MediaEditComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatAutocompleteModule,
    CompactClipCardModule,
    DynamicIframeModule,
    AutoScaleModule,
    ClipPreviewModule,
    WidgetVariableInputModule,
    TranslocoModule,
    MatExpansionModule,
    CodemirrorModule,
    ScriptVariableInputModule
  ],
  providers: [],
})
export class MediaEditModule implements DialogContract<Partial<Clip>> {
  constructor(private dialog: MatDialog) {
  }

  // TODO refactor to use only the ID?
  public openDialog (payload: Partial<Clip>): MatDialogRef<any> {
    const dialogRef = this.dialog.open(MediaEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw'
    });

    return dialogRef;
  }
}
