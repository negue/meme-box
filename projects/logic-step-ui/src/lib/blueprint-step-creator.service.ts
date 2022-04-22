import { Injectable } from '@angular/core';
import { BlueprintEntryStepCall, BlueprintStepInfo } from "@memebox/logic-step-core";
import { DialogService } from "../../../../src/app/shared/dialogs/dialog.service";
import { ClipAssigningMode } from "@memebox/contracts";
import { uuid } from "@gewd/utils";

@Injectable({
  providedIn: 'any'
})
export class BlueprintStepCreatorService {
   public possibleSteps: BlueprintStepInfo[] = [
    {
      stepType: "triggerAction",
      label: "Trigger Action"
    },
     {
       stepType: "triggerActionWhile",
       label: "Trigger Action and keep it visible while doing other steps"
     },
     {
       stepType: "sleepSeconds",
       label: "Wait for Seconds"
     },
     {
       stepType: "obsSwitchScene",
       label: "Switch Scene"
     }
  ];

  constructor(
    private dialogService: DialogService,
  ) { }

  async generateStepData (step: BlueprintStepInfo): Promise<BlueprintEntryStepCall|void> {
    switch (step.stepType) {
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

        const result: BlueprintEntryStepCall = {
          id: uuid(),
          stepType: step.stepType,
          payload: {
            actionId
          },
          entryType: "step",
          subSteps: [],
        };

        if (step.stepType === 'triggerActionWhile') {
          result.subSteps.push({
            label: "Execute Actions",
            entries: []
          });
        }

        return result;
      }
      case "sleepSeconds": {
         return {
          id: uuid(),
          stepType: step.stepType,
          payload: {
            seconds: 1337
          },
          entryType: "step",
          subSteps: [],
        };
      }
    }
  }
}
