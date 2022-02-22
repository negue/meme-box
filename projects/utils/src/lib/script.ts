import {Action, Dictionary} from "@memebox/contracts";
import {ActionVariableConfig, convertExtendedToTypeValues} from "@memebox/action-variables";
import {getVariablesListOfAction, SCRIPT_VARIABLES_KEY} from "./variable.utils";

export interface ScriptConfig {
  executionScript: string;
  bootstrapScript: string;
  variablesConfig?: ActionVariableConfig[];
  settings?: Record<string, unknown>
}

const SCRIPT_EXECUTION_KEY = '_executionScript';
const SCRIPT_BOOTSTRAP_KEY = '_bootstrapScript';
const SCRIPT_SETTINGS_KEY = '_settings';

export function actionDataToScriptConfig (action: Partial<Action>) {
  if (!action?.extended) {
    return null;
  }

  const dynamicContent: ScriptConfig = {
    executionScript: action.extended[SCRIPT_EXECUTION_KEY] ?? '',
    bootstrapScript: action.extended[SCRIPT_BOOTSTRAP_KEY] ?? '',
  };

  dynamicContent.variablesConfig = getVariablesListOfAction(action);

  // todo add a settings type
  const settings: any = JSON.parse(action.extended[SCRIPT_SETTINGS_KEY] ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyScriptConfigToClipData (
  scriptConfig: ScriptConfig,
  targetClip: Partial<Action>
) {
  if (!targetClip.extended) {
    targetClip.extended = {};
  }

  targetClip.extended[SCRIPT_EXECUTION_KEY] = scriptConfig.executionScript;
  targetClip.extended[SCRIPT_BOOTSTRAP_KEY] = scriptConfig.bootstrapScript;

  targetClip.extended[SCRIPT_VARIABLES_KEY] = JSON.stringify(scriptConfig.variablesConfig);
  targetClip.extended[SCRIPT_SETTINGS_KEY] = JSON.stringify(scriptConfig.settings);
}

export const NOT_ALLOWED_SCRIPT_VARIABLE_NAMES = [
  SCRIPT_EXECUTION_KEY,
  SCRIPT_BOOTSTRAP_KEY,
  SCRIPT_VARIABLES_KEY,
  SCRIPT_SETTINGS_KEY,
];

export function extractVariablesFromExtended(
  extended:  Dictionary<any>
){
  const extractedVariables = {...extended};

  for (const propToRemove of NOT_ALLOWED_SCRIPT_VARIABLE_NAMES) {
    delete extractedVariables[propToRemove];
  }

  return extractedVariables;
}

export function getScriptVariablesOrFallbackValues (
  variablesConfig: ActionVariableConfig[],
  scriptAssignedValues: Dictionary<any>,
  payloadAssignedValues?: Dictionary<any>
): Dictionary<unknown> {
  const newValueBag: Dictionary<unknown> = {};

  for (const variablesConfigElement of variablesConfig) {

    // Payload -> Script Assigned -> Fallback
    const valueOfVariable = convertExtendedToTypeValues(
      payloadAssignedValues?.[variablesConfigElement.name]
      ?? scriptAssignedValues[variablesConfigElement.name]
      ?? variablesConfigElement.fallback, variablesConfigElement.type
    );

    newValueBag[variablesConfigElement.name] = valueOfVariable;
  }

  return newValueBag;
}
