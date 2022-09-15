import {
  RecipeCommandBlockRegistry,
  RecipeCommandSelectionGroup,
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

export interface RecipeStepConfigArgument {
  name: string;
  label: string;
  type: string; // todo change to the enum
}

export const RecipeCommandBlockGroups: Record<string, RecipeCommandSelectionGroup> = {
  generic: {
    label: "Generic",
    order: 1
  },
  memebox: {
    label: "Memebox",
    order: 2
  },
  twitch: {
    label: "Twitch",
    order: 3
  },
  obs: {
    label: "OBS",
    order: 4
  }
};

export const RecipeCommandRegistry: RecipeCommandBlockRegistry = {
  "sleepSeconds": {
    pickerLabel: "Wait for Seconds",
    commandGroup: "generic",
    configArguments: [
      {
        name: "seconds",
        label: "Seconds",
        type: "number"
      }
    ],
    toScriptCode: (step, context) => `sleep.secondsAsync(${step.payload.seconds});`,
    commandEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.seconds} seconds`);
    },
    entryIcon: () => 'hourglass_top'
  },
  "sleepMs": {
    pickerLabel: "Wait for Milliseconds",
    commandGroup: "generic",
    configArguments: [
      {
        name: "ms",
        label: "Milliseconds",
        type: "number"
      }
    ],
    toScriptCode: (step, context) => `sleep.msAsync(${step.payload.ms});`,
    commandEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.ms}ms`);
    },
    entryIcon: () => 'hourglass_top'
  }
};


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
