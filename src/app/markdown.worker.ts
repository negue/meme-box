import {expose} from 'comlink';
import {marked} from 'marked';
import * as xss from 'xss';
import {Lazy} from '@gewd/markdown/utils';
import {checkAndReplaceToUnicodeChar, emojiRegex, highlightCode, mermaidRegex} from '@gewd/markdown/worker-functions';
import {DEFAULT_PRISM_OPTIONS, MarkdownWorker, PrismOptions, WorkerOptions} from '@gewd/markdown/contracts';

// web-worker importScripts
declare function importScripts (...urls: string[]): void;

const renderer = new marked.Renderer();
const oldCodeRenderer = renderer.code; // eslint-disable-line @typescript-eslint/unbound-method
renderer.code = function(code, language, isEscaped) {
  if (mermaidRegex.test(language)) {
    return `<div class="mermaid">${language}\n${code}</div>`;
  }
  return oldCodeRenderer.call(this, code, language, isEscaped);
};
renderer.link = function( href, title, text ) {
  return `<a target="_blank" href="${href}" title="${title}">${text}</a>`;
};

let currentConfigObject: WorkerOptions = {
  prism: DEFAULT_PRISM_OPTIONS
};

const lazyPrism = Lazy.create(() => import('prismjs'));
const lazyEmoji = Lazy.create(() => import('@gewd/markdown/emoji-map'));

// apply changes to marked
marked.setOptions({
  // needed for mermaid
  renderer,
  // highlight override for prismjs
  highlight: function(code, lang, callback): any {
    // if it is a mermaid tag, don't need to go through prism it
    // also for code blocks without a language
    if (!lang ||  mermaidRegex.test(lang)) {
      callback(undefined, code);
      return;
    }

    highlightCode(lazyPrism, lang, code, currentConfigObject.prism, importScripts).then(highlightedCode => {
      callback(undefined, highlightedCode);
    });
  }
});

const workerMethods: MarkdownWorker = {
  name: 'marked',
  init: config => {
    currentConfigObject = config;
  },
  initPrism (options: PrismOptions) {
  },
  compile: input => new Promise<string>(async (resolve, reject) => {
    if (!input) {
      resolve('');
      return;
    }

    if (emojiRegex.test(input)) {
      // load emoji-map
      const { EMOJI_MAP, colonToUnicode } = await lazyEmoji.getValue();

      input = checkAndReplaceToUnicodeChar(input, EMOJI_MAP, colonToUnicode);
    }

    marked(input, {
      // aditional marked config, also enables highlight callback
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      // extract?^^
      function resolveCleanMarkup (generatedHTML) {
        const sanatizedHTML = xss.filterXSS(generatedHTML, {
          whiteList: {
            ...xss.whiteList,
            div: ['class'],  // mermaid class
            span: ['class', 'style'],  // prism colors
            h1: ['id'],
            h2: ['id'],
            h3: ['id'],
            h4: ['id'],
            h5: ['id'],
            h6: ['id'],
          }
        });

        resolve(sanatizedHTML);
      }

      resolveCleanMarkup(result);
    });

    return;
  }),
  highlight: (code, lang) => new Promise<string>((resolve, reject) => {
    if (!code) {
      resolve('');
      return;
    }

    function resolveCleanMarkup (generatedHTML) {
      const sanatizedHTML = xss.filterXSS(generatedHTML, {
        whiteList: {
          ...xss.whiteList,
          span: ['class', 'style']  // prism colors
        }
      });

      resolve(sanatizedHTML);
    }

    highlightCode(lazyPrism, lang, code, currentConfigObject.prism, importScripts).then(highlightedCode => {
      resolveCleanMarkup(highlightedCode);
    });

    return;
  })
};

expose(workerMethods);
