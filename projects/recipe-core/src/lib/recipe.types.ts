import {uuid} from "@gewd/utils";
import {Action, ActionType, Dictionary, Screen, Tag, TriggerActionOverrides, UserDataState} from "@memebox/contracts";
import {RecipeStepConfigArguments} from "./recipeStepConfigArgument";
import {Observable} from "rxjs";

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

export interface RecipeSubCommandBlock {
  labelId: string;
  entries: string[]  // entryId
}

export interface RecipeEntryBase {
  id: string;
  awaited?: boolean;
  subCommandBlocks: RecipeSubCommandBlock[];
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

// Refactor to use command block results as variables for the next call

export type GenerateCodeByStepPayload = {
  step: RecipeEntry;
  context: RecipeContext;
  userData: UserDataState;
}

export type CommandBlockCodeGenerationPayload = GenerateCodeByStepPayload & {
  step: RecipeEntryCommandCall
  commandBlock: {
    argument: (name: string) => string
  }
}

export interface RecipeStateQueries{
  screenMap$: Observable<Dictionary<Screen>>;
  tagList$: Observable<Tag[]>;

  getActionById$(actionId: string): Observable<Action>;
}

// Registry Types
export interface RecipeCommandDefinition {
  pickerLabel: string;
  commandEntryLabelAsync: (queries: RecipeStateQueries, payload: RecipeEntryCommandPayload, parentStep: RecipeEntry) => string|Promise<string>;
  subCommandBlockLabelAsync?: (queries: RecipeStateQueries, commandBlock: RecipeEntry, labelId: string) => Promise<string>;
  entryIcon?: (queries: RecipeStateQueries,  payload: RecipeEntryCommandPayload) => string|Promise<string>;
  commandGroup: string;
  configArguments: RecipeStepConfigArguments[]; // each argument name will be applied to the payload as prop

  extendCommandBlock?: (step: RecipeEntryCommandCall, parentStep: RecipeEntry) => void;
  allowedToBeAdded?: (step: RecipeEntry, context: RecipeContext) => boolean;
  toScriptCode: (codePayload: CommandBlockCodeGenerationPayload) => string;
  awaitCodeHandledInternally?: boolean;
  extendCommandBlockOnEdit?: boolean;
  commandType?: string;
}

export interface RecipeCommandSelectionGroup {
  label: string;
  order: number;
}

export interface RecipeCommandBlockRegistry {
  [stepType: string]: RecipeCommandDefinition
}
export interface generatedCodeBySubCommandBlock {
  subCommand: RecipeSubCommandBlock;
  generatedScript: string;
}



export type generateCodeByStep = (payload: GenerateCodeByStepPayload) => generatedCodeBySubCommandBlock[];
