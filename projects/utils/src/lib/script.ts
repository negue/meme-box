import {Clip, Dictionary} from "@memebox/contracts";

export type ScriptVariableTypes = 'text'|'number'|'textarea'|'boolean'|'media'|'mediaList';

export interface ScriptVariable {
  name: string; // TODO validations?
  hint: string;
  type: ScriptVariableTypes;
  fallback: any; // TODO - might need some typesafety .. maybe during runtime
}

export interface ScriptConfig {
  executionScript: string;
  bootstrapScript: string;
  variablesConfig?: ScriptVariable[];
  settings?: {
  }
}


const SCRIPT_EXECUTION_KEY = '_executionScript';
const SCRIPT_BOOTSTRAP_KEY = '_bootstrapScript';
const SCRIPT_VARIABLES_KEY = '_variables';
const SCRIPT_SETTINGS_KEY = '_settings';

export function clipDataToScriptConfig (clip: Partial<Clip>) {
  if (!clip?.extended) {
    return null;
  }

  const dynamicContent: ScriptConfig = {
    executionScript: clip.extended[SCRIPT_EXECUTION_KEY] ?? '',
    bootstrapScript: clip.extended[SCRIPT_BOOTSTRAP_KEY] ?? '',
  };

  const customVariables: ScriptVariable[] = JSON.parse(clip.extended[SCRIPT_VARIABLES_KEY] ?? '[]');
  dynamicContent.variablesConfig = customVariables;

  // todo add a settings type
  const settings: any = JSON.parse(clip.extended[SCRIPT_SETTINGS_KEY] ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyScriptConfigToClipData (
  scriptConfig: ScriptConfig,
  targetClip: Partial<Clip>
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


export function getScriptVariablesOrFallbackValues (
  config: ScriptConfig,
  valueBag: Dictionary<any>
): Dictionary<unknown> {
  const newValueBag: Dictionary<unknown> = {};

  for (const variablesConfigElement of (config.variablesConfig || [])) {
    newValueBag[variablesConfigElement.name] = valueBag[variablesConfigElement.name] || variablesConfigElement.fallback;
  }

  return newValueBag;
}
