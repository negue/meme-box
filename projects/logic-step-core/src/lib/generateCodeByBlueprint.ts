import {BlueprintContext, BlueprintEntry, BlueprintEntryStepCall} from "./blueprint.types";
import {TriggerActionOverrides} from "@memebox/contracts";
import {uuid} from "@gewd/utils";

export interface BlueprintStepDefinition {
  pickerLabel: string;
  needConfigDialog?: string; // special, generic
  generateBlueprintStep: (payload: {[prop: string]: unknown}, parentStep: BlueprintEntry) => BlueprintEntryStepCall;
  allowedToBeAdded?: (step: BlueprintEntry, context: BlueprintContext) => boolean;
  toScriptCode: (step: BlueprintEntryStepCall, context: BlueprintContext) => string;
}

export const BlueprintStepRegistry: {[stepType: string]: BlueprintStepDefinition} = {
  "triggerAction": {
    pickerLabel: "Trigger Action",
    needConfigDialog: "special",
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "triggerAction",
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => {
      const actionId = step.payload.actionId;
      const actionOverrides = step.payload.actionOverrides as TriggerActionOverrides;

      return `memebox.getAction('${actionId}')
                    .trigger(${actionOverrides ? JSON.stringify(actionOverrides) : ''});`;
    },
  },
  "triggerActionWhile": {
    pickerLabel: "Trigger Action and keep it visible while doing other steps",
    needConfigDialog: "special",
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "triggerActionWhile",
        payload: {
          ...payload,
          _suffix: generateRandomCharacters(5)
        },
        entryType: "step",
        subSteps: [
          {
            label: "Execute Actions",
            entries: []
          }
        ],
      };
    },
    toScriptCode: (step, context) => {
      const actionId = step.payload.actionId;
      const screenId = step.payload.screenId;

      const actionOverrides = step.payload.actionOverrides as TriggerActionOverrides;

      const methodArguments = [`'${actionId}'`];

      if(screenId) {
        methodArguments.push(`'${screenId}'`)
      }

      return `memebox.getMedia(${methodArguments.join(',')})
                     .triggerWhile(async (helpers_${step.payload._suffix}) => {
                        ${generateCodeByStep(step, context)}
                      }
                      ${actionOverrides ? ',' + JSON.stringify(actionOverrides) : ''});`;
    },
  },
  "triggerActionWhileReset": {
    pickerLabel: "Reset the 'triggerActionWhileAction' (todo label)",
    generateBlueprintStep: (_, parentStep) => {
      return {
        id: uuid(),
        stepType: "triggerActionWhileReset",
        payload: {
          _suffix: parentStep.entryType === 'step' && parentStep.payload._suffix
        },
        entryType: "step",
        subSteps: [],
      };
    },
    allowedToBeAdded: (step, context) => {
      // todo find a way to have that in multi level scopes available

      return step.entryType === 'step' && step.stepType === 'triggerActionWhile';
    },
    toScriptCode: (step, context) => {
      const helpersName = `helpers_${step.payload._suffix}`;

      return `${helpersName}.reset();`
    },
  },
  "sleepSeconds": {
    pickerLabel: "Wait for Seconds",
    needConfigDialog: "generic", // todo generic field config
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
  },
  "obsSwitchScene": {
    pickerLabel: "Switch Scene",
    needConfigDialog: "generic", // todo generic field config
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
  }
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

        if (subEntry.awaited) {
          result.push('await ');
        }

        result.push(entryDefinition.toScriptCode(subEntry, context).trim());
      } else {
        result.push('TODO FOR TYPE: '+subEntry.entryType);
      }
    }
  }

  return result.join('\r\n');

}

const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const charactersLength = characters.length;

function generateRandomCharacters(length: number) {
  let result           = '';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
