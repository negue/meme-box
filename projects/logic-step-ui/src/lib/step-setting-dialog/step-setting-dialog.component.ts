import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BlueprintEntryStepPayload,
  BlueprintStepConfigActionPayload,
  BlueprintStepConfigArgument
} from "@memebox/logic-step-core";
import {Action, ClipAssigningMode, Dictionary, UnassignedFilterEnum} from "@memebox/contracts";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {Observable} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import cloneDeep from "lodash/cloneDeep";

export interface StepSettingDialogPayload {
  configArguments: BlueprintStepConfigArgument[];
  currentStepData?: BlueprintEntryStepPayload;
}

@Component({
  selector: 'app-step-setting-dialog',
  templateUrl: './step-setting-dialog.component.html',
  styleUrls: ['./step-setting-dialog.component.scss']
})
export class StepSettingDialogComponent {

  public payload: BlueprintEntryStepPayload = {};

  actionDictionary$: Observable<Dictionary<Action>> = this.appQuery.actionMap$;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StepSettingDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private dialogService: DialogService,
    private appQuery: AppQueries,
  ) {
    if (data.currentStepData) {
      this.payload = cloneDeep(data.currentStepData);
    }
  }

  async selectEventClip(configName: string) {
    let actionPayload = this.payload[configName] as any as BlueprintStepConfigActionPayload;

    if (!actionPayload) {
      this.payload[configName] = actionPayload = {
        overrides: {
          action: {
            variables: {}
          }
        }
      } as BlueprintStepConfigActionPayload;
    }

    const actionId = await this.dialogService.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Single,
      selectedItemId: actionPayload.actionId,
      dialogTitle: 'Config Argument',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.BlueprintStepArgument,
      // showOnlyUnassignedFilter: true
    });

    if (actionId) {
      actionPayload.actionId = actionId;
    }
  }

  getActionPayload(configName: string) {
    return this.payload[configName] as any as BlueprintStepConfigActionPayload;
  }

  save() {
    this.dialogRef.close(this.payload);
  }
}
