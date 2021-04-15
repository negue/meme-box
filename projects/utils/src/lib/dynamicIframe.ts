import {Clip} from "@memebox/contracts";

export interface HtmlExternalFile {
  type: 'css'|'script';
  src: string;
}

export interface DynamicIframeContent {
  css?: string;
  html?: string;
  js?: string;
  libraries?: HtmlExternalFile[];
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
    elementsToReplace.push(`
      <div>
        ${content.html}
      </div>
    `);
  }

  // HTML => collection HTML-Elements as string


  elementsToReplace.push(`
    <style>
      html, body {
        margin: 0;
        padding: 0;
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


    customScript.text = content.js;
  }
}

export function clipDataToDynamicIframeContent (clip: Partial<Clip>) {
  if (!clip.extended) {
    return null;
  }

  const dynamicContent: DynamicIframeContent = {
    html: clip.extended['html'] ?? '',
    css: clip.extended['css'] ?? '',
    js: clip.extended['js'] ?? ''
  };

  console.info({extended: clip.extended});

  // JSON
  const externalFiles: HtmlExternalFile[] = JSON.parse(clip.extended['external'] ?? '[]');
  dynamicContent.libraries = externalFiles;

  console.info('json', JSON.stringify(dynamicContent));

  return dynamicContent;
}


export function applyDynamicIframeContentToClipData (iframeContent: DynamicIframeContent, targetClip: Partial<Clip>) {
  console.info('PRE CHANGE', JSON.stringify(targetClip));

  console.info({iframeContent});

  targetClip.extended['html'] = iframeContent.html;
  targetClip.extended['css'] = iframeContent.css;
  targetClip.extended['js'] = iframeContent.js;

  targetClip.extended['external'] = JSON.stringify(iframeContent.libraries);

  console.info('POST CHANGE', JSON.stringify(targetClip));
}
