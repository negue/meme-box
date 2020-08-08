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
import {MatButtonModule} from "@angular/material/button";
import {AkitaNgDevtools} from '@datorama/akita-ngdevtools';
import {AppConfig} from '../environments/environment';
import {TargetScreenComponent} from "./target-screen/target-screen.component";
import {MediaTypeClassPipe} from './target-screen/media-type-class.pipe';
import {ServicesModule} from "./shared/services/services.module";
import {DialogsModule} from "./shared/components/dialogs/dialogs.module";
import {MaterialCssVarsModule, MaterialCssVarsService} from "angular-material-css-vars";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, TargetScreenComponent, MediaTypeClassPipe],
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

    ...AppConfig.ngModules
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public materialCssVarsService: MaterialCssVarsService
  ) {
    const icons = [
      'add',
      'audiotrack',
      'circle',
      'check_circle',
      'content_copy',
      'delete',
      'edit',
      'folder',
      'insert_photo',
      'launch',
      'playlist_add_check',
      'playlist_add',
      'queue',
      'screen',
      'settings',
      'speaker',
      'videocam',
      'video_library'
    ];

    for (const icon of icons) {
      iconRegistry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(
        `./assets/material-icons/${icon}.svg`
      ));
    }

    const hex = '#3f51b5';
    this.materialCssVarsService.setDarkTheme(true);
    this.materialCssVarsService.setPrimaryColor(hex);
    this.materialCssVarsService.setAccentColor('#333');
  }
}
