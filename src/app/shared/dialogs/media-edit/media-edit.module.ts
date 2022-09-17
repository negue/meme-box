import {NgModule} from "@angular/core";
import {MediaEditComponent, MediaEditDialogPayload} from "./media-edit.component";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
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
import {ActionPreviewModule, ActionTypeIconModule, CompactClipCardModule} from "@memebox/state-components";
import {DynamicIframeModule} from "../../components/dynamic-iframe/dynamic-iframe.module";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {TranslocoModule} from "@ngneat/transloco";
import {MatExpansionModule} from "@angular/material/expansion";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {HintPanelModule, StepperContentModule, UiComponentsPipesModule} from "@memebox/ui-components";
import {ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {DirectivesModule} from "../../directives/directives.module";
import {ScriptReadonlyViewComponent} from './script-readonly-view/script-readonly-view.component';
import {DynamicPortalModule} from "@gewd/ng-utils/dynamic-portal";
import {RecipeUiModule} from "@memebox/recipe-ui";
import {DialogsModule} from "../dialogs.module";
import {MatTabsModule} from "@angular/material/tabs";


@NgModule({
  declarations: [
    MediaEditComponent,
    ScriptReadonlyViewComponent
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
    ActionPreviewModule,
    TranslocoModule,
    MatExpansionModule,
    CodemirrorModule,
    ClipboardModule,
    UiComponentsPipesModule,
    ActionTypeIconModule,
    ActionVariablesAssignmentsModule,
    StepperContentModule,
    HintPanelModule,
    OpenFeedbackButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    DirectivesModule,
    DynamicPortalModule,

    DirectivesModule,
    RecipeUiModule,
    DialogsModule,
    MatTabsModule
  ],
  providers: [],
})
export class MediaEditModule implements DialogContract<MediaEditDialogPayload, MediaEditComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: MediaEditDialogPayload): MatDialogRef<MediaEditComponent> {
    const dialogRef = this.dialog.open(MediaEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      autoFocus: false
    });

    return dialogRef;
  }
}
