import {Injectable} from '@angular/core';
import {
  generateRecipeEntryCommandCall,
  RecipeCommandDefinition,
  RecipeCommandRegistry,
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload
} from "@memebox/recipe-core";
import {DialogService} from "../../../../src/app/shared/dialogs/dialog.service";
import type {CommandSettingDialogPayload} from "./command-setting-dialog/step-setting-dialog.component";

@Injectable({
  providedIn: 'any'
})
export class RecipeCommandCreatorService {
  constructor(
    private dialogService: DialogService,
  ) { }

  async generateCommandData (parentStep: RecipeEntry,
                             stepType: string,
                             context: RecipeContext): Promise<RecipeEntryCommandCall|void> {

    const recipeCommandDefinition = RecipeCommandRegistry[stepType];

    if (recipeCommandDefinition.configArguments.length !== 0) {
      const dialogResult = await this._loadAndOpenSettingDialog({
        configArguments: recipeCommandDefinition.configArguments,
        recipeContext: context,
        commandBlockName: recipeCommandDefinition.pickerLabel,
      });

      if (!dialogResult) {
        return;
      }

      const recipeEntryCommandCall = generateRecipeEntryCommandCall(stepType, dialogResult);

      if (recipeCommandDefinition.extendCommandBlock) {
        recipeCommandDefinition.extendCommandBlock(
          recipeEntryCommandCall, parentStep
        );
      }

      return recipeEntryCommandCall;
    } else {
      return generateRecipeEntryCommandCall(stepType, {})
    }
  }

  async editStepData (currentStep: RecipeEntry, context: RecipeContext): Promise<RecipeEntryCommandPayload|void> {
    if (currentStep.entryType !== 'command'){
      return;
    }

    const recipeCommandDefinition = RecipeCommandRegistry[currentStep.commandBlockType];

    if (recipeCommandDefinition.configArguments.length === 0) {
      return;
    }

    const dialogResult = await this._loadAndOpenSettingDialog({
      configArguments: recipeCommandDefinition.configArguments,
      currentStepData: currentStep.payload,
      commandBlockName: recipeCommandDefinition.pickerLabel,
      recipeContext: context
    });

    return dialogResult;
  }

  getPossibleCommands (step: RecipeEntry, context: RecipeContext): RecipeCommandDefinition[] {
    return Object.entries(RecipeCommandRegistry)
      .filter(([_, value]) => {
        if (!value.allowedToBeAdded) {
          return true;
        }

        return value.allowedToBeAdded(step, context);
      })
      .map(([key, value]) => {
        return {
          commandType: key,
          ...value
        }

      });
  }

  async _loadAndOpenSettingDialog(payload: CommandSettingDialogPayload): Promise<RecipeEntryCommandPayload> {
    const dialogRef = await this.dialogService.loadAndOpen(
      import('./command-setting-dialog/command-setting-dialog.module'),
      payload
    );

    const dialogResult: RecipeEntryCommandPayload = await dialogRef.afterClosed().toPromise();

    return dialogResult;
  }
}
