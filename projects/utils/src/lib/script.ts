import {Action, Dictionary} from "@memebox/contracts";
import {ActionVariableConfig, convertExtendedToTypeValues} from "@memebox/action-variables";


export interface ScriptConfig {
  executionScript: string;
  bootstrapScript: string;
  variablesConfig?: ActionVariableConfig[];
  settings?: {
  }
}


const SCRIPT_EXECUTION_KEY = '_executionScript';
const SCRIPT_BOOTSTRAP_KEY = '_bootstrapScript';
export const SCRIPT_VARIABLES_KEY = '_variables';
const SCRIPT_SETTINGS_KEY = '_settings';

export function actionDataToScriptConfig (clip: Partial<Action>) {
  if (!clip?.extended) {
    return null;
  }

  const dynamicContent: ScriptConfig = {
    executionScript: clip.extended[SCRIPT_EXECUTION_KEY] ?? '',
    bootstrapScript: clip.extended[SCRIPT_BOOTSTRAP_KEY] ?? '',
  };

  const customVariables: ActionVariableConfig[] = JSON.parse(clip.extended[SCRIPT_VARIABLES_KEY] ?? '[]');
  dynamicContent.variablesConfig = customVariables;

  // todo add a settings type
  const settings: any = JSON.parse(clip.extended[SCRIPT_SETTINGS_KEY] ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyScriptConfigToClipData (
  scriptConfig: ScriptConfig,
  targetClip: Partial<Action>
) {
  console.info('PRE CHANGE', JSON.stringify(targetClip));

  console.info({iframeContent: scriptConfig});

  if (!targetClip.extended) {
    targetClip.extended = {};
  }

  targetClip.extended[SCRIPT_EXECUTION_KEY] = scriptConfig.executionScript;
  targetClip.extended[SCRIPT_BOOTSTRAP_KEY] = scriptConfig.bootstrapScript;

  targetClip.extended[SCRIPT_VARIABLES_KEY] = JSON.stringify(scriptConfig.variablesConfig);
  targetClip.extended[SCRIPT_SETTINGS_KEY] = JSON.stringify(scriptConfig.settings);

  console.info('POST CHANGE', JSON.stringify(targetClip));
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
