import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatTabsModule } from "@angular/material/tabs";
import { BlueprintEntryComponent } from './blueprint-entry/blueprint-entry.component';
import { GetEntrySubStepInfoPipe } from './get-entry-sub-step-info.pipe';
import { GetEntryStepMetaDataPipe } from './get-entry-step-meta-data.pipe';
import { BlueprintContextDirective } from './blueprint-context.directive';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { BlueprintStepSelectorComponent } from './blueprint-step-selector/blueprint-step-selector.component';
import { OpenFeedbackButtonModule } from "../../../../src/app/shared/components/open-feedback-button/open-feedback-button.module";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { DialogsModule } from "../../../../src/app/shared/dialogs/dialogs.module";
import { BlueprintStepCreatorService } from "./blueprint-step-creator.service";

@NgModule({
  imports: [
    CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, DragDropModule, MatTabsModule, MatCheckboxModule, OpenFeedbackButtonModule, MatIconModule, MatDialogModule, MatListModule, DialogsModule],
  declarations: [
    BlueprintEntryComponent,
    GetEntrySubStepInfoPipe,
    GetEntryStepMetaDataPipe,
    BlueprintContextDirective,
    BlueprintStepSelectorComponent
  ],
  providers: [
    BlueprintStepCreatorService
  ],
  exports: [
    BlueprintEntryComponent,
    BlueprintContextDirective
  ]
})
export class LogicStepUiModule {}
