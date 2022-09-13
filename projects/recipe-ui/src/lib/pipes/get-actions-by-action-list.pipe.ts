import {Pipe, PipeTransform} from '@angular/core';
import {
  listActionsOfActionListPayload,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload
} from "@memebox/recipe-core";
import {AppQueries} from "@memebox/app-state";
import {ActionType, getUserDataState} from "@memebox/contracts";
import {take} from 'rxjs/operators';

@Pipe({
  name: 'getActionsByActionList$',
})
export class GetActionsByActionListPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries
  ) {
  }

  async transform(payload: RecipeCommandConfigActionListPayload): Promise<RecipeCommandConfigActionPayload[]|null> {
    const userDataState = getUserDataState(await this.appQueries.state$.pipe(
      take(1)
    ).toPromise());

    const actionsToChooseFrom = listActionsOfActionListPayload(
      payload,
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
