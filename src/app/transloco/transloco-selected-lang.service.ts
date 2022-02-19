import {Injectable} from "@angular/core";

const selectedLangKey = 'selected_lang';

export function getSelectedLang (): string {
  return localStorage.getItem(selectedLangKey) ?? 'en';
}

@Injectable({providedIn: 'root'})
export class TranslocoSelectedLangService {


  constructor() {
  }

  setSelectedLang (newLang: string): void {
    localStorage.setItem(selectedLangKey, newLang);

    location.reload();
  }
}
