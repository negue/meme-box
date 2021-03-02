import {Pipe, PipeTransform} from '@angular/core';
import {ScreenClip} from "@memebox/contracts";

@Pipe({
  name: 'settingsToSizingType'
})
export class SettingsToSizingTypePipe implements PipeTransform {

  transform(value: ScreenClip): string {
    if (!value) {
      return 'px';
    }

    const hasPercent = [
      value.width,
      value.height,
      value.top,
      value.left,
      value.right,
      value.bottom
    ].join().includes('%');

    return hasPercent ? '%' : 'px';
  }

}
