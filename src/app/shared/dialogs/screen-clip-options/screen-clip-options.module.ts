import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatSelectModule} from "@angular/material/select";
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {ScreenClipOptionsComponent, ScreenClipOptionsPayload} from "./screen-clip-options.component";
import {CustomFormControlModule} from "@gewd/mat-utils/custom-form-control";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatExpansionModule} from "@angular/material/expansion";
import {AnimationPreviewComponent} from './animation-preview/animation-preview.component';
import {PreventAnimationOnFirstViewDirective} from './prevent-animation-on-first-view.directive';
import {HintPanelModule, PipesModule} from "@memebox/ui-components";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {ClipTypeModule} from "@memebox/state-components";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {AnimationLabelPipe} from './animation-label.pipe';

@NgModule({
  declarations: [
    ScreenClipOptionsComponent,
    AnimationPreviewComponent,
    PreventAnimationOnFirstViewDirective,
    AnimationLabelPipe
  ],
  imports: [
    CommonModule,
    CustomFormControlModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    PipesModule,
    MatButtonToggleModule,
    ClipTypeModule,
    CodemirrorModule,
    HintPanelModule
  ],
  providers: [],
})
export class ScreenClipOptionsModule implements DialogContract<ScreenClipOptionsPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ScreenClipOptionsPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ScreenClipOptionsComponent, {
      data: payload,
      width: 'calc(min(1100px, 96%))',
      maxWidth: '96vw'
    });

    return dialogRef;
  }
}
