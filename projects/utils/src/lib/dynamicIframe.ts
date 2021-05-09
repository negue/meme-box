import {Clip, Dictionary} from "@memebox/contracts";
import {replaceVariablesInString} from "./utils";

export interface HtmlExternalFile {
  type: 'css'|'script';
  src: string;
}

export type DynamicIframeVariableTypes = 'text'|'number'|'textarea'|'boolean';

export interface DynamicIframeVariable {
  name: string; // TODO validations?
  hint: string;
  type: DynamicIframeVariableTypes;
  fallback: any; // TODO - might need some typesafety .. maybe during runtime
}

export interface DynamicIframeContent {
  css?: string;
  html?: string;
  js?: string;
  libraries?: HtmlExternalFile[];
  variablesConfig?: DynamicIframeVariable[];
  variables?: Dictionary<any>;
  settings?: {
    subscribeToTwitchEvent?: boolean;
  }
}

export function dynamicIframe (iframe: HTMLIFrameElement,
                               content: DynamicIframeContent) {

  const iframeDocument = iframe.contentDocument;

  // clean up the previous external files
  const allExistingScripts = iframeDocument.body.getElementsByTagName('script');

  for (let scriptIndex = 0; scriptIndex < allExistingScripts.length; scriptIndex++) {
    const script = allExistingScripts.item(scriptIndex);
    console.info({script});
    script.remove();
  }

  const allExistingStyleLinks = iframeDocument.body.getElementsByTagName('link');

  for (let styleLinkIndex = 0; styleLinkIndex < allExistingStyleLinks.length; styleLinkIndex++) {
    const style = allExistingStyleLinks.item(styleLinkIndex);
    console.info({style, length: allExistingStyleLinks.length});
    style.remove();
  }

  // re-add

  if (!content) {
    return;
  }

  const valueBag = content.variables ?? {};

  for (const externalFile of content.libraries) {
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
    const availableVariables = content.variablesConfig
      .filter(config => !!config.fallback);

    const htmlValueBag = {};

    availableVariables
      .forEach(config => {
        htmlValueBag[config.name] = getVariableValueOrFallback(config, valueBag, true);

        if (config.type === 'textarea') {
          htmlValueBag[config.name] = htmlValueBag[config.name].replaceAll('\n', '\\n');
        }
      });

    elementsToReplace.push(`
      <div>
        ${replaceVariablesInString(content.html, availableVariables.map(v => v.name), htmlValueBag)}
      </div>
    `);
  }

  // HTML => collection HTML-Elements as string


  elementsToReplace.push(`
    <style>
      html, body {
        margin: 0;
        padding: 0;

        ${getCssCustomVariables(content.variablesConfig, valueBag)}
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
      ${getJsCustomVariables(content.variablesConfig, valueBag)}
      ${content.js}
    }`;
  }
}

function getVariableValueOrFallback (config: DynamicIframeVariable,
                                     valueBag: Dictionary<any>,
                                     justReturnIt: boolean = false) {
  const valueToReturn = valueBag[config.name] || config.fallback;

  if (config.type === 'number' || config.type === 'boolean' || justReturnIt) {
    return valueToReturn;
  }

  // string
  return `"${valueToReturn}"`;
}

function getJsCustomVariables(variables: DynamicIframeVariable[], valueBag: Dictionary<any>) {
  return variables
    .filter(config => !!config.fallback)
    .map(config => {
    return `const ${config.name} = ${getVariableValueOrFallback(config, valueBag)};`;
  }).join(' ');
}


function getCssCustomVariables(variables: DynamicIframeVariable[], valueBag: Dictionary<any>) {
  return variables
    .filter(config => !!config.fallback && config.type !== "textarea" && config.type !== "boolean")
    .map(config => { return `--${config.name}: ${getVariableValueOrFallback(config, valueBag, true)};`;
  }).join(' ');
}


const DYNAMIC_IFRAME_HTML_KEY = 'html';
const DYNAMIC_IFRAME_CSS_KEY = 'css';
const DYNAMIC_IFRAME_JS_KEY = 'js';
const DYNAMIC_IFRAME_EXTERNAL_KEY = 'external';

const DYNAMIC_IFRAME_VARIABLES_KEY = '_variables';
const DYNAMIC_IFRAME_SETTINGS_KEY = '_settings';

export function clipDataToDynamicIframeContent (clip: Partial<Clip>) {
  if (!clip.extended) {
    return null;
  }

  const dynamicContent: DynamicIframeContent = {
    html: clip.extended[DYNAMIC_IFRAME_HTML_KEY] ?? '',
    css: clip.extended[DYNAMIC_IFRAME_CSS_KEY] ?? '',
    js: clip.extended[DYNAMIC_IFRAME_JS_KEY] ?? ''
  };

  console.info({extended: clip.extended});

  // External Files are saved as JSON
  const externalFiles: HtmlExternalFile[] = JSON.parse(clip.extended[DYNAMIC_IFRAME_EXTERNAL_KEY] ?? '[]');
  dynamicContent.libraries = externalFiles;

  const customVariables: DynamicIframeVariable[] = JSON.parse(clip.extended[DYNAMIC_IFRAME_VARIABLES_KEY] ?? '[]');
  dynamicContent.variablesConfig = customVariables;

  console.info('json', JSON.stringify(dynamicContent));

  // todo add a settings type
  const settings: any = JSON.parse(clip.extended[DYNAMIC_IFRAME_SETTINGS_KEY] ?? '{}');
  dynamicContent.settings = settings;

  return dynamicContent;
}


export function applyDynamicIframeContentToClipData (iframeContent: DynamicIframeContent, targetClip: Partial<Clip>) {
  console.info('PRE CHANGE', JSON.stringify(targetClip));

  console.info({iframeContent});

  targetClip.extended[DYNAMIC_IFRAME_HTML_KEY] = iframeContent.html;
  targetClip.extended[DYNAMIC_IFRAME_CSS_KEY] = iframeContent.css;
  targetClip.extended[DYNAMIC_IFRAME_JS_KEY] = iframeContent.js;

  targetClip.extended[DYNAMIC_IFRAME_EXTERNAL_KEY] = JSON.stringify(iframeContent.libraries);
  targetClip.extended[DYNAMIC_IFRAME_VARIABLES_KEY] = JSON.stringify(iframeContent.variablesConfig);
  targetClip.extended[DYNAMIC_IFRAME_SETTINGS_KEY] = JSON.stringify(iframeContent.settings);

  console.info('POST CHANGE', JSON.stringify(targetClip));
}

const NOT_ALLOWED_NAMES = [
  DYNAMIC_IFRAME_VARIABLES_KEY,
  DYNAMIC_IFRAME_JS_KEY,
  DYNAMIC_IFRAME_CSS_KEY,
  DYNAMIC_IFRAME_EXTERNAL_KEY,
  DYNAMIC_IFRAME_HTML_KEY,
  DYNAMIC_IFRAME_SETTINGS_KEY
];

// TODO how to translate with variables?
export function isDynamicIframeVariableValid(name: string): {ok: boolean, message: string} {
  if (NOT_ALLOWED_NAMES.includes(name)) {
    return { ok: false, message: `Not allowed to be one of the following names: ${NOT_ALLOWED_NAMES.join(', ')}`}
  }

  if (name === '') {
    return { ok: false, message:  'A variable needs a name.'};
  }

  if (name.includes(' ')) {
    return { ok: false, message:  `Variable Names can't have spaces in it: "${name}"`};
  }


  return {ok: true, message: ''};
}
