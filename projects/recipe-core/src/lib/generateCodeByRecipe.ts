import {RecipeContext, RecipeEntry, RecipeEntryCommandCall, RecipeEntryCommandPayload} from "./recipe.types";
import {uuid} from "@gewd/utils";
import {registerMemeboxCommandBlocks} from "./command-blocks.memebox";
import {registerObsCommandBlocks} from "./command-blocks.obs";
import {registerTwitchCommandBlocks} from "./command-blocks.twitch";
import {UserDataState} from "@memebox/contracts";
import {RecipeCommandRegistry} from "./recipeCommandRegistry";


function generateCodeByStepAsync (step: RecipeEntry, context: RecipeContext, userData: UserDataState): string {
  const result: string[] = [];

  for (const subStepInfo of step.subCommandBlocks) {
    for (const entryId of subStepInfo.entries) {
      const subEntry = context.entries[entryId];

      if (!subEntry) {
        result.push(`logger.error('this shouldnt have happened: cant find command block information of ${entryId});`);
      } else if (subEntry.entryType === 'command'){
        const entryDefinition = RecipeCommandRegistry[subEntry.commandBlockType];

        // result.push(`logger.log('Pre: ${subEntry.commandType}');`);

        if (!entryDefinition.awaitCodeHandledInternally && subEntry.awaited) {
          result.push('await ');
        }

        const createdStepCode = entryDefinition.toScriptCode(subEntry, context, userData);

        result.push(createdStepCode.trim());

        // result.push(`logger.log('Post: ${subEntry.commandType}');`);
      } else {
        result.push('TODO FOR TYPE: '+subEntry.entryType);
      }
    }
  }

  return result.join('\r\n');

}

export function generateCodeByRecipe(
  recipeContext: RecipeContext, userData: UserDataState
): string  {
  const result: string[] = [];

  const rootEntry = recipeContext.entries[recipeContext.rootEntry];

  result.push(generateCodeByStepAsync(rootEntry, recipeContext, userData));

  return result.join('\r\n');
}

export function generateRecipeEntryCommandCall (
  commandBlockType: string,
  payload: RecipeEntryCommandPayload
): RecipeEntryCommandCall {
  return {
    id: uuid(),
    commandBlockType,
    payload,
    awaited: true,
    entryType: "command",
    subCommandBlocks: [],
  };
}

registerMemeboxCommandBlocks(RecipeCommandRegistry, generateCodeByStepAsync);
registerObsCommandBlocks(RecipeCommandRegistry);
registerTwitchCommandBlocks(RecipeCommandRegistry);
