import 'reflect-metadata';
import '../polyfills';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatIconModule} from "@angular/material/icon";
import {AppConfig} from '@memebox/app/env';
import {MaterialCssVariables, MaterialCssVarsModule, MaterialCssVarsService} from "angular-material-css-vars";

import {APP_ICONS} from "./app.icons";
import {ServiceWorkerModule} from '@angular/service-worker';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions} from "@angular/material/checkbox";
import {ENVIRONMENT_MODULES} from "@memebox/app/env/modules";
import {ServicesModule, WebSocketBasePathInjectionToken} from "@memebox/app-state";
import {TranslocoRootModule} from './transloco/transloco-root.module';
import {RegisterIconsModule} from "@gewd/mat-utils/material-icons";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions} from "@angular/material/form-field";
import {MarkdownModule} from "./markdown.module";

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


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    }),
    TranslocoRootModule,
    MarkdownModule
  ],
  providers: [
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {
        color: 'primary'
      } as MatCheckboxDefaultOptions
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {
        appearance: 'fill',
        floatLabel: "auto"
      } as MatFormFieldDefaultOptions
    },
    {
      provide: WebSocketBasePathInjectionToken,
      useValue: AppConfig.wsBase
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
