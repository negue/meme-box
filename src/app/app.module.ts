import 'reflect-metadata';
import '../polyfills';

import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { AppConfig } from '@memebox/app/env';
import { MaterialCssVariables, MaterialCssVarsModule, MaterialCssVarsService } from "angular-material-css-vars";
import { StyleguideColors } from './shared/styleguide/styleguide.component';

import { APP_ICONS } from "./app.icons";
import { ServiceWorkerModule } from '@angular/service-worker';
import { DEFAULT_PRISM_OPTIONS, MarkdownServiceOptions } from "@gewd/markdown/contracts";
import { MarkdownOptionsInjectorToken } from "@gewd/markdown/service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from "@angular/material/checkbox";
import { ENVIRONMENT_MODULES } from "../environments/modules/modules";


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
  ],
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
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public materialCssVarsService: MaterialCssVarsService
  ) {
    for (const icon of APP_ICONS) {
      iconRegistry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(
        `./assets/material-icons/${icon}.svg`
      ));
    }

    iconRegistry.addSvgIcon('twitch', sanitizer.bypassSecurityTrustResourceUrl(
      `./assets/twitch.svg`
    ));

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
