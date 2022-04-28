import {
  BlueprintContext,
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintEntryStepPayload,
  BlueprintStepConfigActionPayload
} from "./blueprint.types";
import {TriggerActionOverrides} from "@memebox/contracts";
import {uuid} from "@gewd/utils";
import {AppQueries} from "@memebox/app-state";
import {map, take} from "rxjs/operators";

export interface BlueprintStepConfigArgument {
  name: string;
  label: string;
  type: string;
}

export interface BlueprintStepDefinition {
  pickerLabel: string;
  stepEntryLabelAsync: (queries: AppQueries, payload: BlueprintEntryStepPayload, parentStep: BlueprintEntry) => Promise<string>;
  needConfigDialog?: string; // special, generic
  configArguments: BlueprintStepConfigArgument[]; // each argument name will be applied to the payload as prop
  generateBlueprintStep: (payload: BlueprintEntryStepPayload, parentStep: BlueprintEntry) => BlueprintEntryStepCall;
  allowedToBeAdded?: (step: BlueprintEntry, context: BlueprintContext) => boolean;
  toScriptCode: (step: BlueprintEntryStepCall, context: BlueprintContext) => string;
}

export const BlueprintStepRegistry: {[stepType: string]: BlueprintStepDefinition} = {
  "triggerAction": {
    pickerLabel: "Trigger Action",
    needConfigDialog: "special",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger",
        type: "action"
      }
    ],
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
      const actionPayload = step.payload.action as BlueprintStepConfigActionPayload;

      const actionId = actionPayload.actionId;
      const actionOverrides = actionPayload.overrides;

      return `memebox.getAction('${actionId}')
                    .trigger(${actionOverrides ? JSON.stringify(actionOverrides) : ''});`;
    },
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      const actionPayload = payload.action as BlueprintStepConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  },
  "triggerActionWhile": {
    pickerLabel: "Trigger Action and keep it visible while doing other steps",
    needConfigDialog: "special",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger",
        type: "action"
      }
    ],
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
      const actionPayload = step.payload.action as BlueprintStepConfigActionPayload;

      const actionId = actionPayload.actionId;
      const screenId = actionPayload.screenId;

      const actionOverrides = actionPayload.overrides;

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
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      const actionPayload = payload.action as BlueprintStepConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  },
  "triggerActionWhileReset": {
    pickerLabel: "Reset the 'triggerActionWhileAction' (todo label)",
    configArguments: [],
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
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve('reset');
    },
  },
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
      return Promise.resolve('sleep: ' + payload.seconds);
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
  "triggerRandom": {
    pickerLabel: "Trigger Random Action",
    needConfigDialog: "special",
    configArguments: [
      {
        name: "actions",
        label: "Actions",
        type: "actionList"
      }
    ],
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: "triggerRandom",
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
    stepEntryLabelAsync: (queries, payload, parentStep) => {
      return Promise.resolve('trigger random');
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

const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const charactersLength = characters.length;

function generateRandomCharacters(length: number) {
  let result           = '';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
