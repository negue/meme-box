import {Injectable} from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class SettingsService {

  constructor() {
  }

  public loadSetting(key: string, defaultValue?: string): string {
    return localStorage.getItem(key) ?? defaultValue;
  }

  public saveSetting(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}
