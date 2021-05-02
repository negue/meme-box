import {Injectable} from "@angular/core";
import {Translation, TranslocoLoader} from "@ngneat/transloco";
import {HttpClient} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
