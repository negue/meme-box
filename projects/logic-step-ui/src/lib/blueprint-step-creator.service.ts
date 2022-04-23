import {Injectable} from '@angular/core';
import {
  BlueprintContext,
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintStepInfo,
  BlueprintStepRegistry
} from "@memebox/logic-step-core";
import {DialogService} from "../../../../src/app/shared/dialogs/dialog.service";
import {ClipAssigningMode} from "@memebox/contracts";

@Injectable({
  providedIn: 'any'
})
export class BlueprintStepCreatorService {
  constructor(
    private dialogService: DialogService,
  ) { }

  async generateStepData (parentStep: BlueprintEntry, stepInfo: BlueprintStepInfo): Promise<BlueprintEntryStepCall|void> {
    switch (stepInfo.stepType) {
      case 'triggerAction':
      case 'triggerActionWhile':
      {
        const actionId = await this.dialogService.showActionSelectionDialogAsync({
          mode: ClipAssigningMode.Single,
          dialogTitle: 'Action Variable',
          showMetaItems: true,

          showOnlyUnassignedFilter: true
        });

        if (!actionId) {
          return;
        }

        const result = BlueprintStepRegistry[stepInfo.stepType].generateBlueprintStep({
          actionId
        }, parentStep)

        return result;
      }
      case "sleepSeconds": {
        return BlueprintStepRegistry[stepInfo.stepType].generateBlueprintStep({
          seconds: 1337
        }, parentStep)
      }
      default: {
        return BlueprintStepRegistry[stepInfo.stepType].generateBlueprintStep({

        }, parentStep)
      }
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
