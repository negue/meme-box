import 'reflect-metadata';
import '../polyfills';

import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';

import {AppRoutingModule} from './app-routing.module';
// NG Translate
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatIconRegistry} from "@angular/material/icon";
import {ObsPageComponent} from './obs-page/obs-page.component';
import {MatButtonModule} from "@angular/material/button";
import {AkitaNgDevtools} from '@datorama/akita-ngdevtools';
import {AppConfig} from '../environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, ObsPageComponent],
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

    AppConfig.production ? [] : AkitaNgDevtools.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    const icons = [
      'settings',
      'audiotrack',
      'add',
      'content_copy',
      'delete',
      'edit',
      'playlist_add_check',
      'playlist_add',
      'queue',
      'insert_photo',
      'videocam',
    ];

    for (const icon of icons) {
      iconRegistry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(
        `/assets/material-icons/${icon}.svg`
      ));
    }
  }
}
