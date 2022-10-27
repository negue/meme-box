import {RecipeCommandBlockRegistry} from "./recipe.types";

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
