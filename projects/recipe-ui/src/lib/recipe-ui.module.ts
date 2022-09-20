import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatTabsModule} from "@angular/material/tabs";
import {RecipeBlockComponent} from './recipe-block/recipe-block.component';
import {RecipeContextDirective} from './recipe-context.directive';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {RecipeCommandSelectorComponent} from './recipe-command-selector/recipe-command-selector.component';
import {
  OpenFeedbackButtonModule
} from "../../../../src/app/shared/components/open-feedback-button/open-feedback-button.module";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {DialogsModule} from "../../../../src/app/shared/dialogs/dialogs.module";
import {RecipeCommandCreatorService} from "./recipe-command-creator.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ActionTypeIconModule} from "@memebox/state-components";
import {RecipePipesModule} from "./pipes/recipe-pipes.module";
import {MatRippleModule} from "@angular/material/core";

@NgModule({
  imports: [
    CommonModule, MatFormFieldModule,
    MatInputModule, MatButtonModule,
    MatSelectModule, DragDropModule,
    MatTabsModule, MatCheckboxModule,
    OpenFeedbackButtonModule, MatIconModule,
    MatDialogModule, MatListModule,
    DialogsModule, MatTooltipModule,
    ActionTypeIconModule, RecipePipesModule, MatRippleModule
  ],
  declarations: [
    RecipeBlockComponent,
    RecipeContextDirective,
    RecipeCommandSelectorComponent
  ],
  providers: [
    RecipeCommandCreatorService
  ],
  exports: [
    RecipeBlockComponent,
    RecipeContextDirective
  ]
})
export class RecipeUiModule {}
