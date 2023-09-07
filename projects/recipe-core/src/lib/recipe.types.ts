import {uuid} from "@gewd/utils";
import {
  ActionType,
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload,
  RecipeSubCommandBlock,
  TriggerActionOverrides,
  UserDataState
} from "@memebox/contracts";
import {RecipeStepConfigArguments} from "./recipeStepConfigArgument";
import {AppQueriesInterface} from "./command-blocks.memebox";

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


// Registry Types
export interface RecipeCommandDefinition {
  pickerLabel: string;
  commandEntryLabelAsync: (queries: AppQueriesInterface, payload: RecipeEntryCommandPayload, parentStep: RecipeEntry) => string|Promise<string>;
  subCommandBlockLabelAsync?: (queries: AppQueriesInterface, commandBlock: RecipeEntry, labelId: string) => Promise<string>;
  entryIcon?: (queries: AppQueriesInterface,  payload: RecipeEntryCommandPayload) => string|Promise<string>;
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
