import {
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeContext,
  RecipeEntryCommandCall
} from "./recipe.types";
import {UserDataState} from "@memebox/contracts";

const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const charactersLength = characters.length;

export function generateRandomCharacters(length: number): string  {
  let result           = '';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function* listAllEntriesOfTypes(
  recipeContext: RecipeContext,
  currentCommandToCheck: string,
  commandTypeList: string[]
): IterableIterator<RecipeEntryCommandCall> {
  const entry = recipeContext.entries[currentCommandToCheck];

  if (entry.entryType === 'command') {
    if (commandTypeList.includes(entry.commandBlockType)) {
      yield entry;
    }
  }

  if (entry.subCommandBlocks?.length > 0) {
    for (const subCommandBlock of entry.subCommandBlocks) {
      for (const subEntry of subCommandBlock.entries) {
        yield *listAllEntriesOfTypes(recipeContext, subEntry, commandTypeList);
      }
    }
  }
}

export function listActionsOfActionListPayload (
  actionListPayload: RecipeCommandConfigActionListPayload,
  userData: UserDataState
) {
  const actionsToChooseFrom: RecipeCommandConfigActionPayload[] = [];

  if (!!actionListPayload.actionsByTag) {
    const allActionsOfATag = listActionsByTag(userData, actionListPayload.actionsByTag ?? '');

    actionsToChooseFrom.push(...allActionsOfATag.map(a => {
      return {
        actionId: a.id,
        overrides: {}
      }
    }));
  } else {
    const actionsToIterate = actionListPayload.selectedActions ?? [];

    actionsToChooseFrom.push(...actionsToIterate);
  }

  return actionsToChooseFrom;
}

export function listActionsByTag(userData: UserDataState, tag: string) {
  // by tags
  const allActions = Object.values(userData.actions);
  const allActionsOfATag = allActions.filter(a => a.tags?.includes(tag));

  return allActionsOfATag;
}
