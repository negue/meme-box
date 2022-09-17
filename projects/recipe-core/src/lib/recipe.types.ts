import {uuid} from "@gewd/utils";
import {ActionType, TriggerActionOverrides, UserDataState} from "@memebox/contracts";
import {AppQueries} from "@memebox/app-state";
import {RecipeStepConfigArgument} from "./generateCodeByRecipe";

export interface RecipeSubCommandInfo {
  name: string; // property to save the subSteps
  labelId: string; // see RecipeEntryBase.subCommandBlocks.labelId
  label: string; // to show in the UI
  entries: string[];
}

export interface RecipeCommandInfo {
  stepType: string; // unique name of this step
  label: string;
  icon: string;
}

// at some point custom controls/ui for each stepInfo could be shown

export interface RecipeEntryBase {
  id: string;
  awaited?: boolean;
  subCommandBlocks: {
    labelId: string;
    entries: string[]  // entryId
  }[];
}

export interface RecipeEntryCommandPayload {
  [prop: string]: unknown
}

export interface RecipeEntryCommandCall extends RecipeEntryBase {
  entryType: 'command';
  commandBlockType: string; // connection to RecipeCommandRegistry
  payload: RecipeEntryCommandPayload;
}

export interface RecipeEntryCommandGroup extends RecipeEntryBase {
  entryType: 'group';
}

export interface RecipeEntryCommandFunction extends RecipeEntryBase {
  entryType: 'function';
  functionName: string;
}

export type RecipeEntry = RecipeEntryCommandCall | RecipeEntryCommandGroup | RecipeEntryCommandFunction;

export interface RecipeContext {
  rootEntry: string;
  entries: {[entryId: string]: RecipeEntry}
}

export const RecipeRootCommandBlockId = 'recipeRoot';

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
            labelId: RecipeRootCommandBlockId,
            entries: []
          }
        ]
      }
    }
  };
}

export interface RecipeCommandConfigActionPayload {
  actionId: string;
  screenId?: string;
  uiMetadata?: { // Only filled and used for the Recipe UI
    actionName: string;
    actionType: ActionType;
    hasVariables: boolean;
  };
  overrides: TriggerActionOverrides;
}

export interface RecipeCommandConfigActionListPayload {
  actionsByTag?: string;
  selectedActions: RecipeCommandConfigActionPayload[];
}

export interface RecipeCommandConfigObsSetFilterStatePayload {
  sourceName: string;
  filterName: string;
}

// TODO have a different Interface for queries / AppQueries

// Registry Types
export interface RecipeCommandDefinition {
  pickerLabel: string;
  commandEntryLabelAsync: (queries: AppQueries, payload: RecipeEntryCommandPayload, parentStep: RecipeEntry) => string|Promise<string>;
  subCommandBlockLabelAsync?: (queries: AppQueries, commandBlock: RecipeEntry, labelId: string) => Promise<string>;
  entryIcon?: (queries: AppQueries,  payload: RecipeEntryCommandPayload) => string|Promise<string>;
  commandGroup: string;
  configArguments: RecipeStepConfigArgument[]; // each argument name will be applied to the payload as prop

  extendCommandBlock?: (step: RecipeEntryCommandCall, parentStep: RecipeEntry) => void;
  allowedToBeAdded?: (step: RecipeEntry, context: RecipeContext) => boolean;
  toScriptCode: (step: RecipeEntryCommandCall, context: RecipeContext, userData: UserDataState) => string;
  awaitCodeHandledInternally?: boolean;
  commandType?: string;
}

export interface RecipeCommandSelectionGroup {
  label: string;
  order: number;
}

export interface RecipeCommandBlockRegistry {
  [stepType: string]: RecipeCommandDefinition
}

export type generateCodeByStep = (step: RecipeEntry, context: RecipeContext, userData: UserDataState) => string;
