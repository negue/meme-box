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
  let allExistingScripts = iframeDocument.body.getElementsByTagName('script');

  for (var scriptIndex = 0; scriptIndex<allExistingScripts.length; scriptIndex++) {
    const script = allExistingScripts.item(scriptIndex);
    console.info({script});
    script.remove();
  }

  let allExistingStyleLinks = iframeDocument.body.getElementsByTagName('link');

  for (var styleLinkIndex = 0; styleLinkIndex<allExistingStyleLinks.length; styleLinkIndex++) {
    const style = allExistingStyleLinks.item(styleLinkIndex);
    console.info({style, length: allExistingStyleLinks.length});
    style.remove();
  }

  // re-add

  for (const externalFile of content.libraries) {
    if (externalFile.type === 'css') {
      const newStyle  = iframeDocument.createElement("link");
      newStyle.rel = 'stylesheet'
      newStyle.href = externalFile.src;

      iframeDocument.head.appendChild(newStyle);
    }  else {
      // Script

      const newScript   = iframeDocument.createElement("script");
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

  if (content.css) {
    elementsToReplace.push(`
      <style>
        ${content.css}
      </style>
    `);
  }
  // add all strings into one?  and then apply innerHTML

  var targetElement = iframeDocument.body.querySelector('.customHTML');

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
