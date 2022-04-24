import {Pipe, PipeTransform} from '@angular/core';
import {SelectionStateDictionary} from "./screen-url-dialog.component";

@Pipe({
  name: 'screensArrayToUrl',
  pure: true
})
export class ScreensArrayToUrlPipe implements PipeTransform {

  transform(value: SelectionStateDictionary): string {
    const allEnabledScreens: string[] = [];

    for (const [key, screenInfo] of Object.entries(value)) {
      if (screenInfo.checked) {
        allEnabledScreens.push(key);
      }
    }

    if (allEnabledScreens.length === 0) {
      return '';
    }

    if (allEnabledScreens.length === 1) {
      return `screen/${allEnabledScreens[0]}`;
    }

    return `screens?${allEnabledScreens.map(screenId => `${screenId}=${value[screenId].zIndex}`).join('&')}`
  }
}

