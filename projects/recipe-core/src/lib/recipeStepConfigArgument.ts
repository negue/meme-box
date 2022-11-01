import {RecipeCommandConfigActionPayload} from "./recipe.types";

export interface RecipeStepConfigArgument {
  name: string;
  label: string;
}

export interface RecipeStepConfigBooleanArgument extends RecipeStepConfigArgument {
  type: 'boolean';
}

export interface RecipeStepConfigTextArgument extends RecipeStepConfigArgument {
  type: 'text';
}

export interface RecipeStepConfigTextareaArgument extends RecipeStepConfigArgument {
  type: 'textarea';
}

export interface RecipeStepConfigNumberArgument extends RecipeStepConfigArgument {
  type: 'number';
}

export interface RecipeStepConfigStaticSelectionArgument extends RecipeStepConfigArgument {
  type: 'selectionStatic';
  entries: {id: string, label: string}[];
  defaultSelected: string;
}

export interface RecipeStepConfigActionArgument extends RecipeStepConfigArgument {
  type: 'action';
  flags: {
    allowAllScreens: boolean;
  }
}

export interface RecipeStepConfigActionListArgument extends RecipeStepConfigArgument {
  type: 'actionList';
}

export interface RecipeStepConfigObsSceneArgument extends RecipeStepConfigArgument {
  type: 'obs:scene';
}
export interface RecipeStepConfigObsSourceArgument extends RecipeStepConfigArgument {
  type: 'obs:source';
}
export interface RecipeStepConfigObsFilterArgument extends RecipeStepConfigArgument {
  type: 'obs:filter';
}


export type RecipeStepConfigArguments =
  RecipeStepConfigBooleanArgument |RecipeStepConfigTextArgument|
  RecipeStepConfigTextareaArgument|RecipeStepConfigNumberArgument|
  RecipeStepConfigStaticSelectionArgument|
  RecipeStepConfigActionArgument|RecipeStepConfigActionListArgument|
RecipeStepConfigObsSceneArgument|RecipeStepConfigObsSourceArgument|
  RecipeStepConfigObsFilterArgument
  ;

// any since each paylaod has its own interface
export const RecipeStepConfigArgumentValidations: {
  [typeOf: string]: (configArgument: any, currentConfigPayload: any) => boolean
} = {
  ['action']: (configArgument: RecipeStepConfigActionArgument, currentConfigPayload: RecipeCommandConfigActionPayload) => {
    const isUndefined = typeof currentConfigPayload.screenId === 'undefined'

    if (isUndefined){
      return false;
    }

    if (configArgument.flags.allowAllScreens) {
      return true;
    }

    return !!currentConfigPayload.screenId;
  }
}
