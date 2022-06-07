import {Action, ActionType} from "@memebox/contracts";
import {
  actionDataToWidgetContent,
  applyDynamicIframeContentToClipData,
  DynamicIframeContent,
  HtmlExternalFile,
  mdSection,
  mdSectionAsString,
  mdSectionAsTypedObject
} from "@memebox/utils";
import {MarkdownStructure, startNewMarkdownStructure} from "./md-structure";
import {ActionVariableConfig} from "@memebox/action-variables";

export function convertWidgetToMarkdownStructure(
  action: Action
) {
  const widgetConfig = actionDataToWidgetContent(
    action
  );

  const mdStructure = startNewMarkdownStructure();
  mdStructure.metadata.title = action.name;
  mdStructure.metadata.settings = widgetConfig?.settings;
  mdStructure.metadata.type = action.type;
  mdStructure.description = action.description ?? '';

  if ((widgetConfig?.variablesConfig?.length ?? 0) > 0){
    mdStructure.sections.push(mdSection(
      'variables', 'json', widgetConfig?.variablesConfig
    ));
  }

  if ((widgetConfig?.libraries?.length ?? 0) > 0){
    mdStructure.sections.push(mdSection(
      'libraries', 'json', widgetConfig?.libraries
    ));
  }

  if (widgetConfig?.css) {
    mdStructure.sections.push(mdSection(
      'css', 'css', widgetConfig?.css
    ));
  }

  if (widgetConfig?.html) {
    mdStructure.sections.push(mdSection(
      'html', 'html', widgetConfig?.html
    ));
  }


  if (widgetConfig?.html) {
    mdStructure.sections.push(mdSection(
      'js', 'js', widgetConfig?.js
    ));
  }

  return mdStructure;
}


export function convertMarkdownStructureToWidget(
  mdStructure: MarkdownStructure,
  targetType: ActionType
): Action {
  const action: Action = {
    id: '',
    type: targetType,
    name: mdStructure.metadata.title as string,
    description: mdStructure.description
  };

  const widgetConfig: DynamicIframeContent = {};

  widgetConfig.variablesConfig = mdSectionAsTypedObject<ActionVariableConfig[]>(mdStructure, 'variables') ?? [];
  widgetConfig.libraries = mdSectionAsTypedObject<HtmlExternalFile[]>(mdStructure, 'libraries') ?? [];

  widgetConfig.css = mdSectionAsString(mdStructure, 'css');
  widgetConfig.html = mdSectionAsString(mdStructure, 'html');
  widgetConfig.js = mdSectionAsString(mdStructure, 'js');

  applyDynamicIframeContentToClipData(widgetConfig, action);

  return action;
}
