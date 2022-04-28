import {Injectable} from '@angular/core';
import {
  BlueprintContext,
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintEntryStepPayload,
  BlueprintStepInfo,
  BlueprintStepRegistry
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

  async generateStepData (parentStep: BlueprintEntry, stepInfo: BlueprintStepInfo): Promise<BlueprintEntryStepCall|void> {

    const blueprintRegistryEntry = BlueprintStepRegistry[stepInfo.stepType];

    if (blueprintRegistryEntry.configArguments.length !== 0) {
      const dialogRef = await this.dialogService.loadAndOpen(
        import('./step-setting-dialog/step-setting-dialog.module'),
        {
          configArguments: blueprintRegistryEntry.configArguments
        } as StepSettingDialogPayload
      );

      const dialogResult: BlueprintEntryStepPayload = await dialogRef.afterClosed().toPromise();

      if (!dialogResult) {
        return;
      }

      const generatedBlueprintStep = BlueprintStepRegistry[stepInfo.stepType].generateBlueprintStep(dialogResult, parentStep)

      return generatedBlueprintStep;
    } else {
      return BlueprintStepRegistry[stepInfo.stepType].generateBlueprintStep({}, parentStep)
    }
  }

  getPossibleSteps (step: BlueprintEntry, context: BlueprintContext): BlueprintStepInfo[] {
    return Object.entries(BlueprintStepRegistry)
      .filter(([key, value]) => {
        if (!value.allowedToBeAdded) {
          return true;
        }

        return value.allowedToBeAdded(step, context);
      })
      .map(([key, value]) => {
        return {
          stepType: key,
          label: value.pickerLabel
        }

      });
  }
}
