import 'reflect-metadata';
import '../polyfills';

import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AppConfig } from '../environments/environment';
import { TargetScreenComponent } from "./target-screen/target-screen.component";
import { MediaTypeClassPipe } from './target-screen/media-type-class.pipe';
import { ServicesModule } from "./shared/services/services.module";
import { DialogsModule } from "./shared/components/dialogs/dialogs.module";
import { MaterialCssVariables, MaterialCssVarsModule, MaterialCssVarsService } from "angular-material-css-vars";
import { StyleguideColors } from './shared/styleguide/styleguide.component';

import { PipesModule } from "./core/pipes/pipes.module";
import { MediaToggleDirective } from './target-screen/media-toggle.directive';
import { APP_ICONS } from "./app.icons";
import { ServiceWorkerModule } from '@angular/service-worker';
import { ENVIRONMENT_MODULES } from "@memebox/app/env/modules";
import { DEFAULT_PRISM_OPTIONS, PrismServiceOptions } from "@gewd/markdown/contracts";
import { HighlightEditorModule, PrismOptionsInjectorToken } from "@gewd/components/highlight-editor";

const prismWorker = () => new Worker('./prism.worker.ts', {
  name: 'prism',
  type: "module"
});
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, TargetScreenComponent, MediaTypeClassPipe, MediaToggleDirective ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    MatButtonModule,

    AppConfig.production ? [] : AkitaNgDevtools.forRoot(),
    ServicesModule,
    DialogsModule,

    MaterialCssVarsModule.forRoot({
      // all optional
      isAutoContrast: true,
      darkThemeClass: 'isDarkTheme',
      lightThemeClass: 'isLightTheme',
      // ...
    }),

    ...ENVIRONMENT_MODULES,
    PipesModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: AppConfig.production}),
    MatIconModule,

    HighlightEditorModule,
  ],
  providers: [
    {
      provide: PrismOptionsInjectorToken,
      useValue: {
        getWorker: prismWorker,
        options: {
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
      } as PrismServiceOptions
    },
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
