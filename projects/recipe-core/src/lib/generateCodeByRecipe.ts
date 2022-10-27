import {
  generatedCodeBySubCommandBlock,
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload
} from "./recipe.types";
import {uuid} from "@gewd/utils";
import {registerMemeboxCommandBlocks} from "./command-blocks.memebox";
import {registerObsCommandBlocks} from "./command-blocks.obs";
import {registerTwitchCommandBlocks} from "./command-blocks.twitch";
import {UserDataState} from "@memebox/contracts";
import {RecipeCommandRegistry} from "./recipeCommandRegistry";
import {registerGenericCommandBlocks} from "./command-blocks.generic";


function generateCodeByStepAsync (step: RecipeEntry, context: RecipeContext, userData: UserDataState): generatedCodeBySubCommandBlock[] {
  const result: generatedCodeBySubCommandBlock[] = [];

  for (const subStepInfo of step.subCommandBlocks) {
    const scriptCode: string[] = [];

    for (const entryId of subStepInfo.entries) {
      const subEntry = context.entries[entryId];

      if (!subEntry) {
        scriptCode.push(`logger.error('this shouldnt have happened: cant find command block information of ${entryId});`);
      } else if (subEntry.entryType === 'command'){
        const entryDefinition = RecipeCommandRegistry[subEntry.commandBlockType];

        // result.push(`logger.log('Pre: ${subEntry.commandType}');`);

        if (!entryDefinition.awaitCodeHandledInternally && subEntry.awaited) {
          scriptCode.push('await ');
        }

        const createdStepCode = entryDefinition.toScriptCode(subEntry, context, userData);

        scriptCode.push(createdStepCode.trim());

        // result.push(`logger.log('Post: ${subEntry.commandType}');`);
      } else {
        scriptCode.push('TODO FOR TYPE: '+subEntry.entryType);
      }
    }

    result.push({
      generatedScript: scriptCode.join('\r\n'),
      subCommand: subStepInfo
    });
  }

  return result;

}

export function generateCodeByRecipe(
  recipeContext: RecipeContext, userData: UserDataState
): string  {
  const rootEntry = recipeContext.entries[recipeContext.rootEntry];

  return generateCodeByStepAsync(rootEntry, recipeContext, userData)
    .map(g => g.generatedScript)
    .join('\r\n');
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

registerGenericCommandBlocks(RecipeCommandRegistry, generateCodeByStepAsync);
registerMemeboxCommandBlocks(RecipeCommandRegistry, generateCodeByStepAsync);
registerObsCommandBlocks(RecipeCommandRegistry);
registerTwitchCommandBlocks(RecipeCommandRegistry);
