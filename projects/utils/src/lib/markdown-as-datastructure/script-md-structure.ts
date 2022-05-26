import {Action, ActionType} from "@memebox/contracts";
import {actionDataToScriptConfig, applyScriptConfigToAction, ScriptConfig} from "@memebox/utils";
import {MarkdownStructure, startNewMarkdownSection, startNewMarkdownStructure} from "./md-structure";

export function convertScriptToMarkdownStructure(
  action: Action
) {
  const scriptObj = actionDataToScriptConfig(action);

  const mdStructure = startNewMarkdownStructure();
  mdStructure.metadata.title = action.name;
  mdStructure.description = action.description ?? '';

  if ((scriptObj?.variablesConfig?.length ?? 0) > 0){
    const variablesSection = startNewMarkdownSection('variables', 'json');
    variablesSection.content = scriptObj?.variablesConfig;
    mdStructure.sections.push(variablesSection);
  }

  if (scriptObj?.bootstrapScript) {
    const bootstrapCode = startNewMarkdownSection('bootstrapScript', 'js');
    bootstrapCode.content = scriptObj.bootstrapScript;
    mdStructure.sections.push(bootstrapCode);
  }

  if (scriptObj?.executionScript) {
    const executionCode = startNewMarkdownSection('executionScript', 'js');
    executionCode.content = scriptObj?.executionScript;
    mdStructure.sections.push(executionCode);
  }

  return mdStructure;
}


export function convertMarkdownStructureToScript(
  mdStructure: MarkdownStructure
): Action {
  const action: Action = {
    id: '',
    type: ActionType.Script,
    name: mdStructure.metadata.title as string,
    description: mdStructure.description
  };

  const scriptConfig: ScriptConfig = {
    executionScript: '',
    bootstrapScript: ''
  };

  const variablesSection = mdStructure.sections.find(s => s.name === 'variables');
  if (variablesSection) {
    scriptConfig.variablesConfig = JSON.parse(variablesSection.content as string);
  }

  const bootstrapScriptSection = mdStructure.sections.find(s => s.name === 'bootstrapScript');
  scriptConfig.bootstrapScript = bootstrapScriptSection?.content as string ?? '';

  const executionScriptSection = mdStructure.sections.find(s => s.name === 'executionScript');
  scriptConfig.executionScript = executionScriptSection?.content as string ?? '';

  applyScriptConfigToAction(scriptConfig, action)

  return action;
}
