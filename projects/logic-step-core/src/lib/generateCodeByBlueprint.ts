import {BlueprintContext, BlueprintEntry, BlueprintRegistry} from "./blueprint.types";
import {uuid} from "@gewd/utils";
import {registerMemeboxSteps} from "./blueprint-steps.memebox";

export interface BlueprintStepConfigArgument {
  name: string;
  label: string;
  type: string;
}


export const BlueprintStepRegistry: BlueprintRegistry = {
  "sleepSeconds": {
    pickerLabel: "Wait for Seconds",
    needConfigDialog: "generic", // todo generic field config
    configArguments: [
      {
        name: "seconds",
        label: "Seconds",
        type: "number"
      }
    ],
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "sleepSeconds",
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => `sleep.secondsAsync(${step.payload.seconds});`,
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.seconds} seconds`);
    },
  },
  "sleepMs": {
    pickerLabel: "Wait for Milliseconds",
    needConfigDialog: "generic", // todo generic field config
    configArguments: [
      {
        name: "ms",
        label: "Milliseconds",
        type: "number"
      }
    ],
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "sleepMs",
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => `sleep.msAsync(${step.payload.ms});`,
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`sleep: ${payload.ms}ms`);
    },
  },
  "obsSwitchScene": {
    pickerLabel: "Switch Scene",
    needConfigDialog: "generic", // todo generic field config
    configArguments: [
      {
        name: "targetScene",
        label: "Target Scene",
        type: "obs:scene"
      }
    ],
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "obsSwitchScene",
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => 'todoCode();',
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve('obs: switch scene');
    },
  },
};


export function generateCodeByBlueprint(
  blueprint: BlueprintContext
) {
  const result: string[] = [];

  const rootEntry = blueprint.entries[blueprint.rootEntry];

  result.push(generateCodeByStep(rootEntry, blueprint));

  return result.join('\r\n');
}

function generateCodeByStep (step: BlueprintEntry, context: BlueprintContext) {
  const result: string[] = [];

  for (const subStepInfo of step.subSteps) {
    for (const entryId of subStepInfo.entries) {
      const subEntry = context.entries[entryId];

      if (subEntry.entryType === 'step'){
        const entryDefinition = BlueprintStepRegistry[subEntry.stepType];

        // result.push(`logger.log('Pre: ${subEntry.stepType}');`);

        if (subEntry.awaited) {
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

registerMemeboxSteps(BlueprintStepRegistry, generateCodeByStep);
