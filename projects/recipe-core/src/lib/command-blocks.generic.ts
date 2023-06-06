import {generateCodeByStep, RecipeCommandBlockRegistry} from "./recipe.types";
import {generateRandomCharacters} from "./utils";

export function registerGenericCommandBlocks(
  registry: RecipeCommandBlockRegistry,
  generateCodeByStep: generateCodeByStep
): void {
  registry["sleepSeconds"] = {
    pickerLabel: "Wait for Seconds",
    commandGroup: "generic",
    configArguments: [
      {
        name: "seconds",
        label: "Seconds",
        type: "number"
      }
    ],
    toScriptCode: (codePayload) => `sleep.secondsAsync(${codePayload.commandBlock.argument('seconds')});`,
    commandEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`wait ${payload.seconds} seconds`);
    },
    entryIcon: () => 'hourglass_top'
  };


  registry["sleepMs"] = {
    pickerLabel: "Wait for Milliseconds",
    commandGroup: "generic",
    configArguments: [
      {
        name: "ms",
        label: "Milliseconds",
        type: "number"
      }
    ],
    toScriptCode: (codePayload) => `sleep.msAsync(${codePayload.commandBlock.argument('ms')});`,
    commandEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve(`wait ${payload.ms}ms`);
    },
    entryIcon: () => 'hourglass_top'
  };

  registry["randomCommandGroup"] = {
    pickerLabel: "Random Command Group",
    commandGroup: "generic",
    configArguments: [
      {
        name: 'amountOfGroups',
        label: 'Amount of Groups',
        type: "number"
      }
    ],
    extendCommandBlockOnEdit: true,
    extendCommandBlock: (step) => {
      const amountOfGroups = step.payload.amountOfGroups as number;

      if (step.subCommandBlocks.length === amountOfGroups) {
        return;
      }

      if (amountOfGroups < step.subCommandBlocks.length) {
        step.subCommandBlocks.length = amountOfGroups;
        return;
      }


      const newSubCommandBlockArray = [...step.subCommandBlocks];

      for (let i = step.subCommandBlocks.length; i < amountOfGroups; i++) {
        newSubCommandBlockArray.push({
          labelId: generateRandomCharacters(5),
          entries: []
        });
      }

      step.subCommandBlocks = newSubCommandBlockArray
    },
    subCommandBlockLabelAsync: (queries, commandBlock, labelId) => {
      return Promise.resolve('');
    },
    awaitCodeHandledInternally: true,
    toScriptCode: ({step,userData,context}) => {
      const awaitCode = step.awaited ? 'await ' : '';

      const functionNames: string[] = [];

      const generatedFunctions = generateCodeByStep({step, context, userData}).map(g => {

        const functionName = `randomGroup_${g.subCommand.labelId}`;

        functionNames.push(functionName);

        return `async function ${functionName}() {
                 ${g.generatedScript}
                }`;
      }).join('\r\n');

      return `
        ${awaitCode} (() => {
          ${generatedFunctions}

        const functionsToChoose = [${functionNames.join(',')}];

        return utils.randomElement(functionsToChoose)();
        })();`;
    },
    commandEntryLabelAsync: (queries, payload, parentStep) => {
      return 'trigger any of these command groups randomly';
    }
  };
}
