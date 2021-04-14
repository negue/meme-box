import 'reflect-metadata';
import '../polyfills';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
// NG Translate
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatIconModule} from "@angular/material/icon";
import {AppConfig} from '@memebox/app/env';
import {MaterialCssVariables, MaterialCssVarsModule, MaterialCssVarsService} from "angular-material-css-vars";

import {APP_ICONS} from "./app.icons";
import {ServiceWorkerModule} from '@angular/service-worker';
import {DEFAULT_PRISM_OPTIONS, MarkdownServiceOptions} from "@gewd/markdown/contracts";
import {MarkdownOptionsInjectorToken} from "@gewd/markdown/service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions} from "@angular/material/checkbox";
import {ENVIRONMENT_MODULES} from "../environments/modules/modules";
import {ServicesModule} from "./core/services/services.module";
import {RegisterIconsModule} from "@gewd/mat-utils/material-icons";

export const StyleguideColors = {
  // var(--palette-background-background)
  background: '#2f3640',
  foreground: '#ffffff',
  primary: '#4bcffa',
  // mat-css-color-accent()
  accent: '#575fcf',
  warn: '#f53b57',
  highlight: '#00d8d6', // todo add custom css var
  chipSelected: '#ffd32a'
}


console.warn('APP.MODULE.TS - AppConfig', AppConfig);

const markdownWorker = () => new Worker('./markdown.worker.ts', {
  name: 'markdown',
  type: "module"
});

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,

    MaterialCssVarsModule.forRoot({
      // all optional
      isAutoContrast: true,
      darkThemeClass: 'isDarkTheme',
      lightThemeClass: 'isLightTheme',
      // ...
    }),

    ...ENVIRONMENT_MODULES,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: AppConfig.production}),

    // needed for the MatIconModule
    HttpClientModule,
    MatIconModule,
    MatTooltipModule,
    ServicesModule,

    RegisterIconsModule.register({
      iconArray: APP_ICONS,
      pathToIcons: './assets/material-icons'
    }),
    RegisterIconsModule.register({
      iconArray: ['twitch'],
      pathToIcons: './assets/'
    })
  ],
  providers: [
    // todo extract to custom markdown
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
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {
        color: 'primary'
      } as MatCheckboxDefaultOptions
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    public materialCssVarsService: MaterialCssVarsService
  ) {
    this.materialCssVarsService.setDarkTheme(true);
    this.materialCssVarsService.setAutoContrastEnabled(true)
    this.materialCssVarsService.setPrimaryColor(StyleguideColors.primary);
    this.materialCssVarsService.setAccentColor(StyleguideColors.accent);
    this.materialCssVarsService.setWarnColor(StyleguideColors.warn);
    this.materialCssVarsService.setVariable(MaterialCssVariables.ForegroundText, StyleguideColors.foreground);
    this.materialCssVarsService.setVariable(MaterialCssVariables.ForegroundTextAlpha, '1');
    this.materialCssVarsService.setVariable(MaterialCssVariables.BackgroundBackground, StyleguideColors.background);
  }
}
