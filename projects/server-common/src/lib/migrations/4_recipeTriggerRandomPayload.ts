import {ActionType, SettingsState} from "@memebox/contracts";
import {
  listAllEntriesOfTypes,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload
} from "@memebox/recipe-core";

export function convertRecipeTriggerRandomPayload(configFromFile: SettingsState) {
  const actionKeyValueList = Object.entries(configFromFile.clips);

  for (const [, metaAction] of actionKeyValueList) {
    if (metaAction.type !== ActionType.Recipe) {
      continue;
    }

    for (const recipeCommand of listAllEntriesOfTypes(
      metaAction.recipe, metaAction.recipe.rootEntry, [
        'triggerRandom'
      ]
    )) {
      const selectedActions = recipeCommand.payload['actions'] as RecipeCommandConfigActionPayload[];

      recipeCommand.payload['actions'] = {
        selectedActions
      } as RecipeCommandConfigActionListPayload;
    }
  }
}
