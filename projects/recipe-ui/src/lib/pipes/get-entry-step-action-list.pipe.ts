import {Pipe, PipeTransform} from '@angular/core';
import {
  listActionsOfActionListPayload,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeEntry
} from "@memebox/recipe-core";
import {AppQueries} from "@memebox/app-state";
import {ActionType, getUserDataState} from "@memebox/contracts";
import {take} from 'rxjs/operators';

@Pipe({
  name: 'getEntryStepActionList$',
})
export class GetEntryStepActionListPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries
  ) {
  }

  async transform(value: RecipeEntry): Promise<RecipeCommandConfigActionPayload[]|null> {
    if (value.entryType !== 'command') {
      return  Promise.resolve(null)
    }

    const userDataState = getUserDataState(await this.appQueries.state$.pipe(
      take(1)
    ).toPromise());

    const actionsToChooseFrom = listActionsOfActionListPayload(
      value.payload.actions as RecipeCommandConfigActionListPayload,
      userDataState
    );

    const actionsWithName: RecipeCommandConfigActionPayload[] = [];

    for (const recipeCommandConfigActionPayload of actionsToChooseFrom) {
      const actionId = recipeCommandConfigActionPayload.actionId;

      const actionInfo = userDataState.actions[actionId];

      actionsWithName.push({
        ...recipeCommandConfigActionPayload,
        uiMetadata: {
          actionName: actionInfo?.name ?? 'Unknown Action: '+actionId,
          actionType: actionInfo?.type ?? ActionType.Invalid
        }
      })
    }

    return actionsWithName
  }

}
