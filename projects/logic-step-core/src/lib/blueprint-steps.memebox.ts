import {BlueprintRegistry, BlueprintStepConfigActionPayload, generateCodeByStep} from "./blueprint.types";
import {uuid} from "@gewd/utils";
import {map, take} from "rxjs/operators";
import {generateRandomCharacters} from "./utils";
import {TriggerActionOverrides} from "@memebox/contracts";
import {combineLatest} from "rxjs";

export function registerMemeboxSteps (
  registry: BlueprintRegistry,
  generateCodeByStep: generateCodeByStep
) {
  registry["triggerAction"] = {
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
  };

  registry["triggerActionWhile"] = {
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

      if (screenId) {
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
  };
  registry["triggerActionWhileReset"] = {
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
  };

  registry["triggerRandom"] = {
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
    stepEntryLabelAsync: async (queries, payload, parentStep) => {
      const actionPayload = payload.actions as BlueprintStepConfigActionPayload[];

      const namesOfActions = await combineLatest(
        actionPayload.map(a => queries.getActionById$(a.actionId).pipe(
          map(actionInfo => actionInfo?.name ?? 'unknown action'),
          take(1)
        ))
      )
        .pipe(
          map(allNames => allNames.join(','))
        )
        .toPromise();

      return 'trigger random: '+ namesOfActions;
    },
  };
}
