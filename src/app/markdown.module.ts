import {NgModule} from "@angular/core";
import {MarkdownOptionsInjectorToken} from "@gewd/markdown/service";
import {DEFAULT_PRISM_OPTIONS, MarkdownServiceOptions} from "@gewd/markdown/contracts";

const markdownWorker = () => new Worker('./markdown.worker.ts', {
  name: 'markdown',
  type: "module"
});

@NgModule({
  providers: [
    {
      provide: MarkdownOptionsInjectorToken,
      useValue: {
        getWorker: markdownWorker,
        options: {
          prism: {
            ...DEFAULT_PRISM_OPTIONS,

            /** if needed **/
            languageFileType: 'min.js',  // if you want to use the minified assets
            languageMap: {               // alias to load the real file
              ts: 'typescript',          // default
              cs: 'csharp'               // additional
            },
            highlightMarkdownCode: true,
            additionalPluginPaths: [
              'assets/prism/prism-css-extras.min.js',  // needed for the inline color
              'assets/prism/prism-plugin-inline-color.worker-func.js',
              'assets/prism/prism-plugin-bracket-match.worker-func.js'
            ]
          }
        }
      } as MarkdownServiceOptions
    },
  ]
})
export class MarkdownModule {

}
