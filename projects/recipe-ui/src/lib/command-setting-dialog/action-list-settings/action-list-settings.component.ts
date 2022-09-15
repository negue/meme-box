import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {RecipeCommandConfigActionListPayload, RecipeCommandConfigActionPayload} from "@memebox/recipe-core";
import {Action, ActionAssigningMode, Dictionary, UnassignedFilterEnum} from "@memebox/contracts";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../../../src/app/shared/dialogs/dialog.service";
import {AppQueries} from "@memebox/app-state";
import {CommandSettingDialogPayload} from "../step-setting-dialog.component";

@Component({
  selector: 'app-action-list-settings',
  templateUrl: './action-list-settings.component.html',
  styleUrls: ['./action-list-settings.component.scss']
})
export class ActionListSettingsComponent {

  @Input()
  configPayload!: RecipeCommandConfigActionListPayload;

  @Input()
  actionDictionary!: Dictionary<Action>;

  @Output()
  readonly payloadUpdated = new EventEmitter<RecipeCommandConfigActionListPayload>();

  tagList$ = this.appQuery.tagList$;


  constructor(    @Inject(MAT_DIALOG_DATA) public data: CommandSettingDialogPayload,
                  private dialogRef: MatDialogRef<any>,
                  private dialogService: DialogService,
                  private appQuery: AppQueries,
                  ) { }

  async updateSelectedActions(actionList: RecipeCommandConfigActionPayload[]) {
    const currentActions = actionList.map(a => a.actionId);

    const newSelectedActionIdList = await this.dialogService.showActionSelectionDialogAsync({
      mode: ActionAssigningMode.Multiple,
      selectedActionIdList: currentActions,
      dialogTitle: 'Choose actions to trigger',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.RecipeCommandArgument,
      // showOnlyUnassignedFilter: true
    });


    const newSelectedActions: RecipeCommandConfigActionPayload[] = [];

    for (const newSelectedActionId of newSelectedActionIdList) {
      if (currentActions.includes(newSelectedActionId)) {
        const previousPayload = actionList.find(a => a.actionId === newSelectedActionId);
        if(previousPayload)
        {
          newSelectedActions.push(previousPayload)
        }

        continue;
      }

      newSelectedActions.push({
        actionId: newSelectedActionId,
        overrides: {
          action: {
            variables: {}
          }
        }
      })
    }


    this.updateConfigPayload({
      selectedActions: newSelectedActions
    });
  }

  removeActionEntry(actionList: RecipeCommandConfigActionPayload[], actionEntry: RecipeCommandConfigActionPayload): void  {
    const indexOf = actionList.indexOf(actionEntry);

    actionList.splice(indexOf, 1);
  }

  onTagSelected($event: string) {
    this.updateConfigPayload({
      actionsByTag: $event
    });
  }

  typeOfListChanged($event: string) {
    if ($event === 'manually') {
      this.updateConfigPayload({
        actionsByTag: undefined
      });
    }
  }

  private updateConfigPayload(newPayload: Partial<RecipeCommandConfigActionListPayload>) {
    this.configPayload = {
      ...this.configPayload,
      ...newPayload
    };

    this.payloadUpdated.next(this.configPayload);
  }
}
