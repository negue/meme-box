import {Action, ActionType} from "@memebox/contracts";
import {actionDataToScriptConfig, applyScriptConfigToAction, mdSection, ScriptConfig} from "@memebox/utils";
import {MarkdownStructure, startNewMarkdownStructure} from "./md-structure";

export function convertScriptToMarkdownStructure(
  action: Action
) {
  const scriptObj = actionDataToScriptConfig(action);

  const mdStructure = startNewMarkdownStructure();
  mdStructure.metadata.title = action.name;
  mdStructure.metadata.type = action.type;
  mdStructure.description = action.description ?? '';

  if ((scriptObj?.variablesConfig?.length ?? 0) > 0){
    mdStructure.sections.push(mdSection(
      'variables', 'json', scriptObj?.variablesConfig
    ));
  }

  if (scriptObj?.bootstrapScript) {
    mdStructure.sections.push(mdSection(
      'bootstrapScript', 'js', scriptObj?.bootstrapScript
    ));
  }

  if (scriptObj?.executionScript) {
    mdStructure.sections.push(mdSection(
      'executionScript', 'js', scriptObj?.executionScript
    ));
  }

  return mdStructure;
}


export function convertMarkdownStructureToScript(
  mdStructure: MarkdownStructure,
  targetType: ActionType
): Action {
  const action: Action = {
    id: '',
    type: targetType,
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
