import {Action, Dictionary} from "@memebox/contracts";
import {ActionVariableConfig, convertExtendedToTypeValues} from "@memebox/action-variables";
import {getVariablesConfigListOfAction, SCRIPT_VARIABLES_KEY} from "./variable.utils";

export interface ScriptConfig {
  executionScript: string;
  bootstrapScript: string;
  variablesConfig?: ActionVariableConfig[];
  settings?: Record<string, unknown>
}

const SCRIPT_EXECUTION_KEY = '_executionScript';
const SCRIPT_BOOTSTRAP_KEY = '_bootstrapScript';
const SCRIPT_SETTINGS_KEY = '_settings';

export function actionDataToScriptConfig (action: Partial<Action>): ScriptConfig|null {
  if (!action?.extended) {
    return null;
  }

  const dynamicContent: ScriptConfig = {
    executionScript: action.extended[SCRIPT_EXECUTION_KEY] as string ?? '',
    bootstrapScript: action.extended[SCRIPT_BOOTSTRAP_KEY] as string ?? '',
  };

  dynamicContent.variablesConfig = getVariablesConfigListOfAction(action);

  // todo add a settings type
  const settings: any = JSON.parse(action.extended[SCRIPT_SETTINGS_KEY] as string ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyScriptConfigToAction (
  scriptConfig: ScriptConfig,
  targetAction: Partial<Action>
): void  {
  if (!targetAction.extended) {
    targetAction.extended = {};
  }

  targetAction.extended[SCRIPT_EXECUTION_KEY] = scriptConfig.executionScript;
  targetAction.extended[SCRIPT_BOOTSTRAP_KEY] = scriptConfig.bootstrapScript;

  targetAction.extended[SCRIPT_VARIABLES_KEY] = JSON.stringify(scriptConfig.variablesConfig);
  targetAction.extended[SCRIPT_SETTINGS_KEY] = JSON.stringify(scriptConfig.settings);
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
