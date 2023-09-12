
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
