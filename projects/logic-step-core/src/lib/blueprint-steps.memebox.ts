import {
  BlueprintRegistry,
  BlueprintStepConfigActionListPayload,
  BlueprintStepConfigActionPayload,
  generateCodeByStep
} from "./blueprint.types";
import {map, take} from "rxjs/operators";
import {generateRandomCharacters} from "./utils";
import {combineLatest} from "rxjs";

export function registerMemeboxSteps (
  registry: BlueprintRegistry,
  generateCodeByStep: generateCodeByStep
): void  {
  registry["triggerAction"] = {
    pickerLabel: "Trigger Action",
    stepGroup: "memebox",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger",
        type: "action"
      }
    ],
    toScriptCode: (step) => {
      const actionPayload = step.payload.action as BlueprintStepConfigActionPayload;

      const actionId = actionPayload.actionId;
      const actionOverrides = actionPayload.overrides;

      return `memebox.getAction('${actionId}')
                    .trigger(${actionOverrides ? JSON.stringify(actionOverrides) : ''});`;
    },
    stepEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as BlueprintStepConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  };

  registry["triggerActionWhile"] = {
    pickerLabel: "Trigger Action and keep it visible while doing other steps",
    stepGroup: "memebox",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger",
        type: "action"
      }
    ],
    extendBlueprintStep: (step) => {
      step.payload = {
        ...step.payload,
        _suffix: generateRandomCharacters(5)
      };

      step.subSteps.push( {
        label: "Execute Actions",
        entries: []
      });
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
    stepEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as BlueprintStepConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  };
  registry["triggerActionWhileReset"] = {
    pickerLabel: "Reset the 'triggerActionWhileAction' (todo label)",
    stepGroup: "memebox",
    configArguments: [],
    extendBlueprintStep: (step, parentStep) => {
      step.payload._suffix = parentStep.entryType === 'step' && parentStep.payload._suffix;
    },
    allowedToBeAdded: (step) => {
      // todo find a way to have that in multi level scopes available

      return step.entryType === 'step' && step.stepType === 'triggerActionWhile';
    },
    toScriptCode: (step) => {
      const helpersName = `helpers_${step.payload._suffix}`;

      return `${helpersName}.reset();`
    },
    stepEntryLabelAsync: () => {
      return Promise.resolve('reset');
    },
  };

  registry["triggerRandom"] = {
    pickerLabel: "Trigger Random Action",
    stepGroup: "memebox",
    configArguments: [
      {
        name: "actions",
        label: "Actions",
        type: "actionList"
      }
    ],
    awaitCodeHandledInternally: true,
    toScriptCode: (step) => {
      const awaitCode = step.awaited ? 'await ': '';

      return `
        ${awaitCode} (() => {
        const actionsToChooseFrom = [${
          (step.payload.actions as BlueprintStepConfigActionListPayload)
            .map(action => JSON.stringify(action))
            .join(',')
        }];

        return memebox.triggerRandom(actionsToChooseFrom);
        })();
      `;
    },
    stepEntryLabelAsync: async (queries, payload) => {
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


  registry["updateActionProperties"] = {
    pickerLabel: "Update Action Properties",
    stepGroup: "memebox",
    configArguments: [
      {
        name: "action",
        label: "Action to update properties",
        type: "action"
      },
    /*  {
        name: "overrides",
        label: "Properties to update",
        type: "actionOverrides"
      }*/
    ],
    awaitCodeHandledInternally: true,
    toScriptCode: (step) => {
      const actionPayload = step.payload.action as BlueprintStepConfigActionPayload;
      const overrides = actionPayload.overrides;

      const actionId = actionPayload.actionId;

      const awaitCode = step.awaited ? 'await ': '';

      const actionApiVariable = overrides.screenMedia
        ? `memebox.getMedia('${actionId}')`
        : `memebox.getAction('${actionId}')`;

      const updateVariables = overrides.action?.variables
        ? `promisesArray.push(action.updateVariables(${JSON.stringify(overrides.action)}));`
        : '';

      const updateMediaProps = overrides.screenMedia
        ? `promisesArray.push(action.updateScreenOptions(${JSON.stringify(overrides.screenMedia)}));`
        : '';

      console.info({
        actionApiVariable,
        updateVariables,
        updateMediaProps
      });

      return `
${awaitCode} (() => {
        const action = ${actionApiVariable};

        const promisesArray = [];

      ${updateVariables}
      ${updateMediaProps}


                    return Promise.all(promisesArray);
                    })();
                    `;
    },
    stepEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as BlueprintStepConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo =>  'Update Properties of: ' + actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  };
}
