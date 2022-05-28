import {
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintEntryStepPayload,
  BlueprintRegistry,
  BlueprintStepSelectionGroup,
  RecipeContext
} from "./blueprint.types";
import {uuid} from "@gewd/utils";
import {registerMemeboxSteps} from "./command-blocks.memebox";
import {registerObsCommandBlocks} from "./command-blocks.obs";

export interface BlueprintStepConfigArgument {
  name: string;
  label: string;
  type: string;
}

export const BlueprintCommandBlockGroups: Record<string, BlueprintStepSelectionGroup> = {
  generic: {
    label: "Generic",
    order: 1
  },
  memebox: {
    label: "Memebox",
    order: 2
  },
  obs: {
    label: "OBS",
    order: 3
  }
};

export const BlueprintStepRegistry: BlueprintRegistry = {
  "sleepSeconds": {
    pickerLabel: "Wait for Seconds",
    stepGroup: "generic",
    configArguments: [
      {
        name: "seconds",
        label: "Seconds",
        type: "number"
      }
    ],
    toScriptCode: (step, context) => `sleep.secondsAsync(${step.payload.seconds});`,
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.seconds} seconds`);
    },
  },
  "sleepMs": {
    pickerLabel: "Wait for Milliseconds",
    stepGroup: "generic",
    configArguments: [
      {
        name: "ms",
        label: "Milliseconds",
        type: "number"
      }
    ],
    toScriptCode: (step, context) => `sleep.msAsync(${step.payload.ms});`,
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.ms}ms`);
    },
  }
};


function generateCodeByStep (step: BlueprintEntry, context: RecipeContext) {
  const result: string[] = [];

  for (const subStepInfo of step.subCommandBlocks) {
    for (const entryId of subStepInfo.entries) {
      const subEntry = context.entries[entryId];

      if (!subEntry) {
        result.push(`logger.error('this shouldnt have happened: cant find command block information of ${entryId});`);
      } else if (subEntry.entryType === 'step'){
        const entryDefinition = BlueprintStepRegistry[subEntry.stepType];

        // result.push(`logger.log('Pre: ${subEntry.stepType}');`);

        if (!entryDefinition.awaitCodeHandledInternally && subEntry.awaited) {
          result.push('await ');
        }

        result.push(entryDefinition.toScriptCode(subEntry, context).trim());

        // result.push(`logger.log('Post: ${subEntry.stepType}');`);
      } else {
        result.push('TODO FOR TYPE: '+subEntry.entryType);
      }
    }
  }

  return result.join('\r\n');

}

export function generateCodeByBlueprint(
  blueprint: RecipeContext
): string  {
  const result: string[] = [];

  const rootEntry = blueprint.entries[blueprint.rootEntry];

  result.push(generateCodeByStep(rootEntry, blueprint));

  return result.join('\r\n');
}

export function generateStepEntry (
  stepType: string,
  payload: BlueprintEntryStepPayload
): BlueprintEntryStepCall {
  return {
    id: uuid(),
    stepType,
    payload,
    awaited: true,
    entryType: "step",
    subCommandBlocks: [],
  };
}

registerMemeboxSteps(BlueprintStepRegistry, generateCodeByStep);
registerObsCommandBlocks(BlueprintStepRegistry);
