import {GenerateCodeByStepPayload, generatedCodeBySubCommandBlock} from "./recipe.types";
import {uuid} from "@gewd/utils";
import {registerMemeboxCommandBlocks} from "./command-blocks.memebox";
import {registerObsCommandBlocks} from "./command-blocks.obs";
import {registerTwitchCommandBlocks} from "./command-blocks.twitch";
import {RecipeContext, RecipeEntryCommandCall, RecipeEntryCommandPayload, UserDataState} from "@memebox/contracts";
import {RecipeCommandRegistry} from "./recipeCommandRegistry";
import {registerGenericCommandBlocks} from "./command-blocks.generic";


function generateCodeByStepAsync ({step, context, userData}: GenerateCodeByStepPayload): generatedCodeBySubCommandBlock[] {
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

        // todo "Mark Scripts / Recipes to know which source they might be triggered from"
        //   => inline recipe in twitch triggers which sets the context inside for example trigger variables
        // todo think of way to use other commadn block results in the current one
        // todo commandBlockData should cache if there is no dynamic data to speed up things

        const createdStepCode = entryDefinition.toScriptCode({
          step: subEntry,
          context,
          commandBlock: {
            argument(name) {
              // todo check of config if name exist
              // also check that on the UI during edit
              return `await commandBlockData['${subEntry.id}']['${name}']()`
            }
          },
          userData
        });

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

  return generateCodeByStepAsync({step: rootEntry, context: recipeContext, userData})
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
