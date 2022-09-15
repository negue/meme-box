import {
  generateCodeByStep,
  RecipeCommandBlockRegistry,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload
} from "./recipe.types";
import {map, take} from "rxjs/operators";
import {generateRandomCharacters, listActionsOfActionListPayload} from "./utils";
import {ACTION_TYPE_INFORMATION} from "@memebox/contracts";

function createMemeboxApiVariable(
  actionPayload: RecipeCommandConfigActionPayload
) {
  const actionId = actionPayload.actionId;
  const screenId = actionPayload.screenId;

  const methodArguments = [`'${actionId}'`];

  if (screenId) {
    methodArguments.push(`'${screenId}'`)
  }

  const actionApiVariable = methodArguments.length > 1 || actionPayload.overrides?.screenMedia
    ? `memebox.getMedia(${methodArguments.join(',')})`
    : `memebox.getAction('${actionId}')`;

  return actionApiVariable;
}

export function registerMemeboxCommandBlocks (
  registry: RecipeCommandBlockRegistry,
  generateCodeByStep: generateCodeByStep
): void  {
  registry["triggerAction"] = {
    pickerLabel: "Trigger Action",
    commandGroup: "memebox",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger",
        type: "action"
      }
    ],
    toScriptCode: (step) => {
      const actionPayload = step.payload.action as RecipeCommandConfigActionPayload;

      const actionOverrides = actionPayload.overrides;

      return `${createMemeboxApiVariable(actionPayload)}
              .trigger(${actionOverrides ? JSON.stringify(actionOverrides) : ''});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as RecipeCommandConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    },
    entryIcon: (queries, payload) => {
      const actionPayload = payload.action as RecipeCommandConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(action => ACTION_TYPE_INFORMATION[action.type].icon),
        take(1)
      ).toPromise();
    },
  };

  const keepTriggeredActionActiveWhileLabel = 'Keep Triggered Action active, while';

  registry["triggerActionWhile"] = {
    pickerLabel: keepTriggeredActionActiveWhileLabel,
    commandGroup: "memebox",
    configArguments: [
      {
        name: "action",
        label: "Action to trigger, keep active",
        type: "action"
      }
    ],
    subCommandBlockLabelAsync: (queries, commandBlock, labelId) =>  {
      const actionPayload = commandBlock.entryType === "command"
        && commandBlock.payload.action as RecipeCommandConfigActionPayload;

      if (!actionPayload) {
        return Promise.resolve('Unknown Action');
      }

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(action => `Keep Triggered Action ${action.name} active, while these commands are running: `),
        take(1)
      ).toPromise();
    },
    extendCommandBlock: (step) => {
      step.payload = {
        ...step.payload,
        _suffix: generateRandomCharacters(5)
      };

      step.subCommandBlocks.push( {
        labelId: "keepVisibleWhile",
        entries: []
      });
    },
    toScriptCode: (step, context, userData) => {
      const actionPayload = step.payload.action as RecipeCommandConfigActionPayload;

      const actionOverrides = actionPayload.overrides;

      return `${createMemeboxApiVariable(actionPayload)}
                     .triggerWhile(async (helpers_${step.payload._suffix}) => {
                        ${generateCodeByStep(step, context, userData)}
                      }
                      ${actionOverrides ? ',' + JSON.stringify(actionOverrides) : ''});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as RecipeCommandConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo => actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  };
  registry["triggerActionWhileReset"] = {
    pickerLabel: `Reset changed properties of the '${keepTriggeredActionActiveWhileLabel}'`,
    commandGroup: "memebox",
    configArguments: [],
    extendCommandBlock: (step, parentStep) => {
      step.payload._suffix = parentStep.entryType === 'command' && parentStep.payload._suffix;
    },
    allowedToBeAdded: (step) => {
      // todo find a way to have that in multi level scopes available
      return false;
      // return step.entryType === 'command' && step.commandBlockType === 'triggerActionWhile';
    },
    toScriptCode: (step) => {
      const helpersName = `helpers_${step.payload._suffix}`;

      return `${helpersName}.reset();`
    },
    commandEntryLabelAsync: () => {
      return Promise.resolve('reset');
    },
  };

  registry["triggerRandom"] = {
    pickerLabel: "Trigger Random Action",
    commandGroup: "memebox",
    configArguments: [
      {
        name: "actions",
        label: "Possible Actions to be triggered, randomly",
        type: "actionList"
      }
    ],
    awaitCodeHandledInternally: true,
    toScriptCode: (step, context, userData) => {
      const awaitCode = step.awaited ? 'await ': '';

      const actionsToChooseFrom = listActionsOfActionListPayload(
        step.payload.actions as RecipeCommandConfigActionListPayload,
        userData
      );

      return `
        ${awaitCode} (() => {
        const actionsToChooseFrom = [${actionsToChooseFrom
        .map(action => JSON.stringify(action))
        .join(',')}];

        return memebox.triggerRandom(actionsToChooseFrom);
        })();
      `;
    },
    commandEntryLabelAsync: async (queries, payload) => {
      const actionListPayload = (payload.actions as RecipeCommandConfigActionListPayload);

      if (actionListPayload.actionsByTag) {
        const tags = await queries.tagList$.pipe(
          take(1)
        ).toPromise();
        const tagName = tags.find(t => t.id === actionListPayload.actionsByTag)?.name
          ?? `\r\nUnknown Tag: ${actionListPayload.actionsByTag}`;

        return `trigger any action with the tag: ${tagName}`;
      }

      return `trigger any of the following: ${actionListPayload.selectedActions.length}`;
    },
  };


  registry["updateActionProperties"] = {
    pickerLabel: "Update Action Properties",
    commandGroup: "memebox",
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
      const actionPayload = step.payload.action as RecipeCommandConfigActionPayload;
      const overrides = actionPayload.overrides;

      const awaitCode = step.awaited ? 'await ': '';

      const updateVariables = overrides.action?.variables
        ? `promisesArray.push(action.updateVariables(${JSON.stringify(overrides.action)}));`
        : '';

      const updateMediaProps = overrides.screenMedia
        ? `promisesArray.push(action.updateScreenOptions(${JSON.stringify(overrides.screenMedia)}));`
        : '';

      return `
${awaitCode} (() => {
        const action = ${createMemeboxApiVariable(actionPayload)};

        const promisesArray = [];

      ${updateVariables}
      ${updateMediaProps}


                    return Promise.all(promisesArray);
                    })();
                    `;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const actionPayload = payload.action as RecipeCommandConfigActionPayload;

      return queries.getActionById$(actionPayload.actionId).pipe(
        map(actionInfo =>  'Update Properties of: ' + actionInfo?.name ?? 'unknown action'),
        take(1)
      ).toPromise();
    }
  };
}
