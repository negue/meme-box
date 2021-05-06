import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_FALLBACK_STRATEGY,
  TRANSLOCO_LOADER,
  TRANSLOCO_SCOPE,
  translocoConfig,
  TranslocoFallbackStrategy,
  TranslocoModule
} from '@ngneat/transloco';
import {NgModule} from '@angular/core';
import {AppConfig} from '@memebox/app/env';
import {TranslocoHttpLoader} from "./transloco-http-loader.service";
import {getSelectedLang} from "./transloco-selected-lang.service";


export class CustomStrategy implements TranslocoFallbackStrategy {
  getNextLangs(failedLang: string) {
    console.info('failed', failedLang);
    return ['en'];
  }
}

export const customFallbackStrategy = {
  provide: TRANSLOCO_FALLBACK_STRATEGY,
  useClass: CustomStrategy
};

const activeLang = getSelectedLang();

@NgModule({
  exports: [ TranslocoModule ],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'de'],
        defaultLang: activeLang,
        missingHandler: {
          useFallbackTranslation: true,
        },
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: false,
        prodMode: AppConfig.production,
        fallbackLang: 'en'
      })
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
    { provide: TRANSLOCO_SCOPE, useValue: { scope: 'common', alias: '$common$'}, multi: true}
  ]
})
export class TranslocoRootModule {}
