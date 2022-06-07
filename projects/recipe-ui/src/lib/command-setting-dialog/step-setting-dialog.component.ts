import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeContext,
  RecipeEntryCommandPayload,
  RecipeStepConfigArgument
} from "@memebox/recipe-core";
import {Action, ClipAssigningMode, Dictionary, TriggerActionOverrides, UnassignedFilterEnum} from "@memebox/contracts";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {Observable} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import cloneDeep from "lodash/cloneDeep";
import {isVisibleMedia} from "@memebox/shared-state";

export interface CommandSettingDialogPayload {
  configArguments: RecipeStepConfigArgument[];
  currentStepData?: RecipeEntryCommandPayload;
  commandBlockName: string;
  recipeContext: RecipeContext;
}

@Component({
  selector: 'app-step-setting-dialog',
  templateUrl: './step-setting-dialog.component.html',
  styleUrls: ['./step-setting-dialog.component.scss']
})
export class StepSettingDialogComponent {

  public payload: RecipeEntryCommandPayload = {};

  actionDictionary$: Observable<Dictionary<Action>> = this.appQuery.actionMap$;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CommandSettingDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private dialogService: DialogService,
    private appQuery: AppQueries,
  ) {
   this._prepareCurrentPayload();
  }

  onSelectedAction(configName: string, newActionId: string) {
    const actionPayload = this._getOrPreparePayloadForAction(configName);

    if (newActionId) {
      actionPayload.actionId = newActionId;
    }
  }

  async selectAction(configName: string) {
    const actionId = await this._selectAction();

    this.onSelectedAction(configName, actionId);
  }

  async selectActionListEntry(actionPayload: RecipeCommandConfigActionPayload) {
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

    return this.payload[findActionConfig.name] as any as RecipeCommandConfigActionPayload;
  }

  getActionOverridesPayload(configName: string) {
    const action = this.getActionPayloadOfConfigList();

    return {
      action,
      configPayload: this.payload[configName] as any as TriggerActionOverrides
    }
  }

  getActionPayload(configName: string) {
    return this.payload[configName] as any as RecipeCommandConfigActionPayload;
  }

  isMedia(action: Action): boolean {
    if (!action) {
      return false;
    }

    return isVisibleMedia(action.type);
  }


  getActionListPayload(configName: string): RecipeCommandConfigActionListPayload  {
    return this.payload[configName] as any as RecipeCommandConfigActionListPayload;
  }

  save(): void  {
    this.dialogRef.close(this.payload);
  }

  async addActionEntry(actionList: RecipeCommandConfigActionPayload[]) {
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

  removeActionEntry(actionList: RecipeCommandConfigActionPayload[], actionEntry: RecipeCommandConfigActionPayload): void  {
    const indexOf = actionList.indexOf(actionEntry);

    actionList.splice(indexOf, 1);
  }

  private _selectAction (actionId?: string | undefined): Promise<string> {
    return this.dialogService.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Single,
      selectedItemId: actionId,
      dialogTitle: 'Config Argument',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.RecipeCommandArgument,
      // showOnlyUnassignedFilter: true
    });
  }

  private _getOrPreparePayloadForAction (configName: string): RecipeCommandConfigActionPayload {
    let actionPayload = this.payload[configName] as any as RecipeCommandConfigActionPayload;

    if (!actionPayload) {
      this.payload[configName] = actionPayload = {

      } as RecipeCommandConfigActionPayload;
    }

    actionPayload.overrides = Object.assign( {
      action: {
        variables: {}
      },
      screenMedia: {

      }
    }, actionPayload.overrides);

    return actionPayload;
  }

  private _prepareCurrentPayload() {
    if (this.data.currentStepData) {
      this.payload = cloneDeep(this.data.currentStepData);
    }

    for (const config of this.data.configArguments) {
      switch (config.type) {
        case 'actionList': {
          if (!this.payload[config.name]) {
            this.payload[config.name] = [];
          }
          break;
        }
        case 'boolean': {
          if (!this.payload[config.name]) {
            this.payload[config.name] = false;
          }
          break;
        }
        case 'action': {
          this._getOrPreparePayloadForAction(config.name);
          break;
        }
      }
    }
  }

}
