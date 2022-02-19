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
import {ServiceWorkerModule} from '@angular/service-worker';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions} from "@angular/material/checkbox";
import {ENVIRONMENT_MODULES} from "@memebox/app/env/modules";
import {ServicesModule, WebSocketBasePathInjectionToken} from "@memebox/app-state";
import {TranslocoRootModule} from './transloco/transloco-root.module';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions} from "@angular/material/form-field";
import {MarkdownModule} from "./markdown.module";
import {DarkmodeModule} from "./darkmode.module";
import {IconsModule} from "./icons.module";
import {HighlightEditorModule} from "@gewd/components/highlight-editor";

console.warn('APP.MODULE.TS - AppConfig', AppConfig);


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DarkmodeModule,

    ...ENVIRONMENT_MODULES,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: AppConfig.production}),

    // needed for the MatIconModule
    HttpClientModule,
    MatIconModule,
    MatTooltipModule,
    ServicesModule,

    IconsModule,
    TranslocoRootModule,
    MarkdownModule,
    HighlightEditorModule
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

}
