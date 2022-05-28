import {uuid} from "@gewd/utils";
import {TriggerActionOverrides} from "@memebox/contracts";
import {AppQueries} from "@memebox/app-state";
import {BlueprintStepConfigArgument} from "./generateCodeByBlueprint";

export interface BlueprintSubStepInfo {
  name: string; // property to save the subSteps
  labelId: string; // see BlueprintEntryBase.subCommandBlocks.labelId
  label: string; // to show in the UI
  entries: string[];
}

export interface BlueprintStepInfo {
  stepType: string; // unique name of this step
  label: string;
}

// at some point custom controls/ui for each stepInfo could be shown

export interface BlueprintEntryBase {
  id: string;
  awaited?: boolean;
  subCommandBlocks: {
    labelId: string;
    entries: string[]  // entryId
  }[];
}

export interface BlueprintEntryStepPayload {
  [prop: string]: unknown
}

export interface BlueprintEntryStepCall extends BlueprintEntryBase {
  entryType: 'step';
  stepType: string; // connection to BlueprintStepInfo
  payload: BlueprintEntryStepPayload;
}

export interface BlueprintEntryStepGroup extends BlueprintEntryBase {
  entryType: 'group';
}

export interface BlueprintEntryStepFunction extends BlueprintEntryBase {
  entryType: 'function';
  functionName: string;
}

export type BlueprintEntry = BlueprintEntryStepCall | BlueprintEntryStepGroup | BlueprintEntryStepFunction;

// Blueprint
// => entries
//     => step or group
//         => step to call

export interface Blueprint {
  entries: BlueprintEntry[];
}

export interface RecipeContext {
  rootEntry: string;
  entries: {[entryId: string]: BlueprintEntry}
}


export function createRecipeContext (): RecipeContext {
  const rootId = uuid();

  return {
    rootEntry: rootId,
    entries: {
      [rootId]: {
        id: rootId,
        entryType: "group",
        awaited: false,
        subCommandBlocks: [
          {
            labelId: 'recipeRoot',
            entries: []
          }
        ]
      }
    }
  };
}

export interface BlueprintStepConfigActionPayload {
  actionId: string;
  screenId?: string;
  overrides: TriggerActionOverrides;
}

export type BlueprintStepConfigActionListPayload = BlueprintStepConfigActionPayload[];

export interface BlueprintStepConfigObsSetFilterStatePayload {
  sourceName: string;
  filterName: string;
}


// Registry Types
export interface BlueprintStepDefinition {
  pickerLabel: string;
  stepEntryLabelAsync: (queries: AppQueries, payload: BlueprintEntryStepPayload, parentStep: BlueprintEntry) => Promise<string>;
  subCommandBlockLabelAsync?: (queries: AppQueries, commandBlock: BlueprintEntry) => Promise<string>;
  stepGroup: string;
  configArguments: BlueprintStepConfigArgument[]; // each argument name will be applied to the payload as prop

  // todo refactor so that each call doesn't need to fill ALL the properties only the needed onces for this type
  extendBlueprintStep?: (step: BlueprintEntryStepCall, parentStep: BlueprintEntry) => void;
  allowedToBeAdded?: (step: BlueprintEntry, context: RecipeContext) => boolean;
  toScriptCode: (step: BlueprintEntryStepCall, context: RecipeContext) => string;
  awaitCodeHandledInternally?: boolean;
  stepType?: string;
}

export interface BlueprintStepSelectionGroup {
  label: string;
  order: number;
}

export interface BlueprintRegistry {
  [stepType: string]: BlueprintStepDefinition
}

export type generateCodeByStep = (step: BlueprintEntry, context: RecipeContext) => string;
