import {HttpClient} from '@angular/common/http';
import {
  Translation,
  TRANSLOCO_CONFIG,
  TRANSLOCO_FALLBACK_STRATEGY,
  TRANSLOCO_LOADER,
  translocoConfig,
  TranslocoFallbackStrategy,
  TranslocoLoader,
  TranslocoModule
} from '@ngneat/transloco';
import {Injectable, NgModule} from '@angular/core';
import {AppConfig} from '@memebox/app/env';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}


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

@NgModule({
  exports: [ TranslocoModule ],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        missingHandler: {
          useFallbackTranslation: true,
        },
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: AppConfig.production,
        fallbackLang: 'en'
      })
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ]
})
export class TranslocoRootModule {}
