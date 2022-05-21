import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BlueprintEntryStepPayload,
  BlueprintStepConfigActionListPayload,
  BlueprintStepConfigActionPayload,
  BlueprintStepConfigArgument
} from "@memebox/logic-step-core";
import {Action, ClipAssigningMode, Dictionary, TriggerActionOverrides, UnassignedFilterEnum} from "@memebox/contracts";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {Observable} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import cloneDeep from "lodash/cloneDeep";
import {isVisibleMedia} from "@memebox/shared-state";

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
        switch (config.type) {
          case 'actionList': {
            this.payload[config.name] = [];
            break;
          }
          case 'boolean': {
            this.payload[config.name] = false;
            break;
          }
        }

        if (config.type === 'actionList') {
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
          },
          screenMedia: {

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

  getActionPayloadOfConfigList() {
    const findActionConfig = this.data.configArguments.find(c => c.type === 'action');

    if (!findActionConfig) {
      return null;
    }

    return this.payload[findActionConfig.name] as any as BlueprintStepConfigActionPayload;
  }

  getActionOverridesPayload(configName: string) {
    const action = this.getActionPayloadOfConfigList();

    return {
      action,
      configPayload: this.payload[configName] as any as TriggerActionOverrides
    }
  }

  getActionPayload(configName: string) {
    return this.payload[configName] as any as BlueprintStepConfigActionPayload;
  }

  isMedia(action: Action) {
    if (!action) {
      return false;
    }

    return isVisibleMedia(action.type);
  }


  getActionListPayload(configName: string): BlueprintStepConfigActionListPayload  {
    return this.payload[configName] as any as BlueprintStepConfigActionListPayload;
  }

  save(): void  {
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

  removeActionEntry(actionList: BlueprintStepConfigActionPayload[], actionEntry: BlueprintStepConfigActionPayload): void  {
    const indexOf = actionList.indexOf(actionEntry);

    actionList.splice(indexOf, 1);
  }
}
