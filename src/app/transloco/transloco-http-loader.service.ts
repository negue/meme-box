import {Injectable} from "@angular/core";
import {Translation, TranslocoLoader} from "@ngneat/transloco";
import {HttpClient} from "@angular/common/http";
import {Dictionary} from "@memebox/contracts";
import {Observable} from "rxjs";
import {publishReplay, refCount} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class TranslocoHttpLoader implements TranslocoLoader {
  private loadedTranslationFilesCache: Dictionary<Observable<Translation>> = {};

  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string) {
    if (this.loadedTranslationFilesCache[lang]) {
      return this.loadedTranslationFilesCache[lang];
    }

    return this.loadedTranslationFilesCache[lang] = this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
      publishReplay(),
      refCount()
    );
  }
}
