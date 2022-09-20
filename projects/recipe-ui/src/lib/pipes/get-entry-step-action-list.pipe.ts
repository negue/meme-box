import {Pipe, PipeTransform} from '@angular/core';
import {
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeEntry
} from "@memebox/recipe-core";
import {AppQueries} from "@memebox/app-state";
import {GetActionsByActionListPipe} from "./get-actions-by-action-list.pipe";

@Pipe({
  name: 'getEntryStepActionList$',
})
export class GetEntryStepActionListPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries,
    private actionsByActionList: GetActionsByActionListPipe
  ) {
  }

  transform(value: RecipeEntry): Promise<RecipeCommandConfigActionPayload[]|null> {
    if (value.entryType !== 'command') {
      return  Promise.resolve(null)
    }

    return this.actionsByActionList.transform(value.payload.actions as RecipeCommandConfigActionListPayload);
  }

}
