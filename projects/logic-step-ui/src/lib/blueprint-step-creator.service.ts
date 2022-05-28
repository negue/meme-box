import {Injectable} from '@angular/core';
import {
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintEntryStepPayload,
  BlueprintStepDefinition,
  BlueprintStepRegistry,
  generateStepEntry,
  RecipeContext
} from "@memebox/logic-step-core";
import {DialogService} from "../../../../src/app/shared/dialogs/dialog.service";
import type {StepSettingDialogPayload} from "./step-setting-dialog/step-setting-dialog.component";

@Injectable({
  providedIn: 'any'
})
export class BlueprintStepCreatorService {
  constructor(
    private dialogService: DialogService,
  ) { }

  async generateStepData (parentStep: BlueprintEntry, stepType: string): Promise<BlueprintEntryStepCall|void> {

    const blueprintRegistryEntry = BlueprintStepRegistry[stepType];

    if (blueprintRegistryEntry.configArguments.length !== 0) {
      const dialogResult = await this._loadAndOpenSettingDialog({
        configArguments: blueprintRegistryEntry.configArguments
      });

      if (!dialogResult) {
        return;
      }

      const generatedBlueprintStep = generateStepEntry(stepType, dialogResult);

      if (blueprintRegistryEntry.extendBlueprintStep) {
        blueprintRegistryEntry.extendBlueprintStep(
          generatedBlueprintStep, parentStep
        );
      }

      return generatedBlueprintStep;
    } else {
      return generateStepEntry(stepType, {})
    }
  }

  async editStepData (currentStep: BlueprintEntry): Promise<BlueprintEntryStepPayload|void> {
    if (currentStep.entryType !== 'step'){
      return;
    }

    const blueprintRegistryEntry = BlueprintStepRegistry[currentStep.stepType];

    if (blueprintRegistryEntry.configArguments.length === 0) {
      return;
    }

    const dialogResult = await this._loadAndOpenSettingDialog({
      configArguments: blueprintRegistryEntry.configArguments,
      currentStepData: currentStep.payload
    });

    return dialogResult;
  }

  getPossibleSteps (step: BlueprintEntry, context: RecipeContext): BlueprintStepDefinition[] {
    return Object.entries(BlueprintStepRegistry)
      .filter(([_, value]) => {
        if (!value.allowedToBeAdded) {
          return true;
        }

        return value.allowedToBeAdded(step, context);
      })
      .map(([key, value]) => {
        return {
          stepType: key,
          ...value
        }

      });
  }

  async _loadAndOpenSettingDialog(payload: StepSettingDialogPayload): Promise<BlueprintEntryStepPayload> {
    const dialogRef = await this.dialogService.loadAndOpen(
      import('./step-setting-dialog/step-setting-dialog.module'),
      payload
    );

    const dialogResult: BlueprintEntryStepPayload = await dialogRef.afterClosed().toPromise();

    return dialogResult;
  }
}
