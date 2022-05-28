import { Injectable } from '@angular/core';
import {
  generateStepEntry,
  RecipeCommandDefinition,
  RecipeCommandRegistry,
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload
} from "@memebox/recipe-core";
import { DialogService } from "../../../../src/app/shared/dialogs/dialog.service";
import type { StepSettingDialogPayload } from "./step-setting-dialog/step-setting-dialog.component";

@Injectable({
  providedIn: 'any'
})
export class BlueprintStepCreatorService {
  constructor(
    private dialogService: DialogService,
  ) { }

  async generateStepData (parentStep: RecipeEntry, stepType: string): Promise<RecipeEntryCommandCall|void> {

    const blueprintRegistryEntry = RecipeCommandRegistry[stepType];

    if (blueprintRegistryEntry.configArguments.length !== 0) {
      const dialogResult = await this._loadAndOpenSettingDialog({
        configArguments: blueprintRegistryEntry.configArguments
      });

      if (!dialogResult) {
        return;
      }

      const generatedBlueprintStep = generateStepEntry(stepType, dialogResult);

      if (blueprintRegistryEntry.extendCommandBlock) {
        blueprintRegistryEntry.extendCommandBlock(
          generatedBlueprintStep, parentStep
        );
      }

      return generatedBlueprintStep;
    } else {
      return generateStepEntry(stepType, {})
    }
  }

  async editStepData (currentStep: RecipeEntry): Promise<RecipeEntryCommandPayload|void> {
    if (currentStep.entryType !== 'step'){
      return;
    }

    const blueprintRegistryEntry = RecipeCommandRegistry[currentStep.stepType];

    if (blueprintRegistryEntry.configArguments.length === 0) {
      return;
    }

    const dialogResult = await this._loadAndOpenSettingDialog({
      configArguments: blueprintRegistryEntry.configArguments,
      currentStepData: currentStep.payload
    });

    return dialogResult;
  }

  getPossibleSteps (step: RecipeEntry, context: RecipeContext): RecipeCommandDefinition[] {
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

  async _loadAndOpenSettingDialog(payload: StepSettingDialogPayload): Promise<RecipeEntryCommandPayload> {
    const dialogRef = await this.dialogService.loadAndOpen(
      import('./step-setting-dialog/step-setting-dialog.module'),
      payload
    );

    const dialogResult: RecipeEntryCommandPayload = await dialogRef.afterClosed().toPromise();

    return dialogResult;
  }
}
