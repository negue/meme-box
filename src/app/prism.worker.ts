import { expose } from 'comlink';
import * as xss from 'xss';
import { Lazy } from '@gewd/markdown/utils';
import { highlightCode } from '@gewd/markdown/worker-functions';
import { DEFAULT_PRISM_OPTIONS, PrismOptions, PrismWorker } from '@gewd/markdown/contracts';

// web-worker importScripts
declare function importScripts (...urls: string[]): void;

let currentConfigObject: PrismOptions = DEFAULT_PRISM_OPTIONS;

const lazyPrism = Lazy.create(() => import('prismjs'));

const workerMethods: PrismWorker = {
  initPrism (options: PrismOptions) {
    currentConfigObject = options;
  },
  name: 'prism',
  highlight: (code, lang) => new Promise<string>(async (resolve, reject) => {
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

    highlightCode(lazyPrism, lang, code, currentConfigObject, importScripts).then(highlightedCode => {
      resolveCleanMarkup(highlightedCode);
    });

    return;
  })
};

expose(workerMethods);

