import {Action, Dictionary} from "@memebox/contracts";
import {replaceVariablesInString} from "./utils";
import {ActionVariableConfig} from "@memebox/action-variables";
import {getVariablesListOfAction, SCRIPT_VARIABLES_KEY} from "./variable.utils";

export interface HtmlExternalFile {
  type: 'css'|'script';
  src: string;
}

export interface DynamicIframeContent {
  css?: string;
  html?: string;
  js?: string;
  libraries?: HtmlExternalFile[];
  variablesConfig?: ActionVariableConfig[];
  variables?: Dictionary<any>;
  settings?: {
    subscribeToTwitchEvent?: boolean;
  }
}

export function dynamicIframe (iframe: HTMLIFrameElement,
                               content: DynamicIframeContent) {

  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument) {
    return;
  }

  // clean up the previous external files
  const allExistingScripts = iframeDocument.body.getElementsByTagName('script');

  for (let scriptIndex = 0; scriptIndex < allExistingScripts.length; scriptIndex++) {
    const script = allExistingScripts.item(scriptIndex);
    script?.remove();
  }

  const allExistingStyleLinks = iframeDocument.body.getElementsByTagName('link');

  for (let styleLinkIndex = 0; styleLinkIndex < allExistingStyleLinks.length; styleLinkIndex++) {
    const style = allExistingStyleLinks.item(styleLinkIndex);
    style?.remove();
  }

  // re-add

  if (!content) {
    return;
  }

  const valueBag = content.variables ?? {};

  const librariesArray = content.libraries ?? [];
  const variablesConfig = content.variablesConfig ?? [];

  for (const externalFile of librariesArray) {
    if (externalFile.type === 'css') {
      const newStyle = iframeDocument.createElement("link");
      newStyle.rel = 'stylesheet'
      newStyle.href = externalFile.src;

      iframeDocument.head.appendChild(newStyle);
    } else {
      // Script

      const newScript = iframeDocument.createElement("script");
      newScript.src = externalFile.src;

      iframeDocument.head.appendChild(newScript);
    }
  }

  const elementsToReplace: string[] = [];

  if (content.html) {

    const htmlValueBag: Record<string, unknown> = {};

    variablesConfig
      .forEach(config => {
        htmlValueBag[config.name] = getVariableValueOrFallback(config, valueBag, true);

        if (config.type === 'textarea') {
          let valueOfName = htmlValueBag[config.name] as string;

          if (config.htmlNewLineBreak) {
            valueOfName = valueOfName.replaceAll('\n', '<br/>');
          }

          htmlValueBag[config.name] = valueOfName;
        }
      });

    const replacedHtmlWithVariablesContent = replaceVariablesInString(content.html, variablesConfig.map(v => v.name), htmlValueBag);

    elementsToReplace.push(`
      <div>
        ${replacedHtmlWithVariablesContent}
      </div>
    `);
  }

  // HTML => collection HTML-Elements as string


  elementsToReplace.push(`
    <style>
      html, body {
        margin: 0;
        padding: 0;

        ${getCssCustomVariables(variablesConfig, valueBag)}
      }

      iframe {
        border: 0;
      }

      body {
        overflow: hidden;
      }
      ${content.css}
    </style>
  `);

  // add all strings into one?  and then apply innerHTML

  let targetElement = iframeDocument.body.querySelector('.customHTML');

  if (!targetElement) {
    targetElement = iframeDocument.createElement('div');
    targetElement.classList.add('customHTML');
    iframeDocument.body.appendChild(targetElement);
  }

  targetElement.innerHTML = elementsToReplace.join('');


  if (content.js) {
    const customScript = iframeDocument.createElement("script");


    iframeDocument.body.appendChild(customScript);

    customScript.text = ` {
      ${getJsCustomVariables(variablesConfig, valueBag)}
      ${content.js}
    }`;
  }
}

function getVariableValueOrFallback (config: ActionVariableConfig,
                                     valueBag: Dictionary<any>,
                                     justReturnIt: boolean = false) {
  const valueOfBag = valueBag[config.name];
  const valueToReturn = typeof valueOfBag === 'undefined'
    ? config.fallback
    : valueOfBag;

  if (config.type === 'number' || config.type === 'boolean' || justReturnIt) {
    return valueToReturn;
  }

  if (config.type === 'textarea') {
    return "`" + valueToReturn + "`";
  }

  // string
  return `"${valueToReturn}"`;
}

function getJsCustomVariables(variables: ActionVariableConfig[], valueBag: Dictionary<any>) {
  return variables
    .filter(config => !!config.fallback)
    .map(config => {
    return `const ${config.name} = ${getVariableValueOrFallback(config, valueBag)};`;
  }).join(' ');
}


function getCssCustomVariables(variables: ActionVariableConfig[], valueBag: Dictionary<any>) {
  return variables
    .filter(config => !!config.fallback && config.type !== "textarea" && config.type !== "boolean")
    .map(config => { return `--${config.name}: ${getVariableValueOrFallback(config, valueBag, true)};`;
  }).join(' ');
}


const DYNAMIC_IFRAME_HTML_KEY = 'html';
const DYNAMIC_IFRAME_CSS_KEY = 'css';
const DYNAMIC_IFRAME_JS_KEY = 'js';
const DYNAMIC_IFRAME_EXTERNAL_KEY = 'external';

const DYNAMIC_IFRAME_SETTINGS_KEY = '_settings';

export function actionDataToWidgetContent (action: Partial<Action>): DynamicIframeContent|null {
  if (!action?.extended) {
    return null;
  }

  const dynamicContent: DynamicIframeContent = {
    html: action.extended[DYNAMIC_IFRAME_HTML_KEY] ?? '',
    css: action.extended[DYNAMIC_IFRAME_CSS_KEY] ?? '',
    js: action.extended[DYNAMIC_IFRAME_JS_KEY] ?? ''
  };

  // External Files are saved as JSON
  const externalFiles: HtmlExternalFile[] = JSON.parse(action.extended[DYNAMIC_IFRAME_EXTERNAL_KEY] ?? '[]');
  dynamicContent.libraries = externalFiles;

  dynamicContent.variablesConfig = getVariablesListOfAction(action);

  // todo add a settings type
  const settings: any = JSON.parse(action.extended[DYNAMIC_IFRAME_SETTINGS_KEY] ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyDynamicIframeContentToClipData (
  iframeContent: DynamicIframeContent,
  targetClip: Partial<Action>
) {
  if (!targetClip.extended) {
    targetClip.extended = {};
  }

  targetClip.extended[DYNAMIC_IFRAME_HTML_KEY] = iframeContent.html ?? '';
  targetClip.extended[DYNAMIC_IFRAME_CSS_KEY] = iframeContent.css ?? '';
  targetClip.extended[DYNAMIC_IFRAME_JS_KEY] = iframeContent.js ?? '';

  targetClip.extended[DYNAMIC_IFRAME_EXTERNAL_KEY] = JSON.stringify(iframeContent.libraries);
  targetClip.extended[SCRIPT_VARIABLES_KEY] = JSON.stringify(iframeContent.variablesConfig);
  targetClip.extended[DYNAMIC_IFRAME_SETTINGS_KEY] = JSON.stringify(iframeContent.settings);
}

export const NOT_ALLOWED_WIDGET_VARIABLE_NAMES = [
  SCRIPT_VARIABLES_KEY,
  DYNAMIC_IFRAME_JS_KEY,
  DYNAMIC_IFRAME_CSS_KEY,
  DYNAMIC_IFRAME_EXTERNAL_KEY,
  DYNAMIC_IFRAME_HTML_KEY,
  DYNAMIC_IFRAME_SETTINGS_KEY
];


