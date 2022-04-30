import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BlueprintEntryStepPayload,
  BlueprintStepConfigActionListPayload,
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
    } else {
      for (const config of data.configArguments) {
        if (config.type === 'actionList') {
          this.payload[config.name] = [];
        }
      }
    }
  }

  async selectAction(configName: string) {
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

    const actionId = await this._selectAction();

    if (actionId) {
      actionPayload.actionId = actionId;
    }
  }

  async selectActionListEntry(actionPayload: BlueprintStepConfigActionPayload) {
    const actionId = await this._selectAction();

    if (actionId) {
      actionPayload.actionId = actionId;
    }
  }

  getActionPayload(configName: string) {
    return this.payload[configName] as any as BlueprintStepConfigActionPayload;
  }

  getActionListPayload(configName: string) {
    return this.payload[configName] as any as BlueprintStepConfigActionListPayload;
  }

  save() {
    this.dialogRef.close(this.payload);
  }

  async addActionEntry(actionList: BlueprintStepConfigActionPayload[]) {
    const actionId = await this._selectAction();

    if (actionId) {
      actionList.push({
        actionId,
        overrides: {
          action: {
            variables: {}
          }
        }
      })
    }
  }

  private _selectAction (actionId?: string | undefined): Promise<string> {
    return this.dialogService.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Single,
      selectedItemId: actionId,
      dialogTitle: 'Config Argument',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.BlueprintStepArgument,
      // showOnlyUnassignedFilter: true
    });
  }

  removeActionEntry(actionList: BlueprintStepConfigActionPayload[], actionEntry: BlueprintStepConfigActionPayload) {
    const indexOf = actionList.indexOf(actionEntry);

    actionList.splice(indexOf, 1);
  }
}
