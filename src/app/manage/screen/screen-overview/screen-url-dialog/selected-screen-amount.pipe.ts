import {Pipe, PipeTransform} from "@angular/core";
import {SelectionStateDictionary} from "./screen-url-dialog.component";

@Pipe({
  name: 'selectedScreensAmount',
  pure: true
})
export class SelectedScreenAmountPipe implements PipeTransform {

  transform(value: SelectionStateDictionary): number {
    let checkedCounter = 0;

    for (const [key, screenInfo] of Object.entries(value)) {
      if (screenInfo.checked) {
        checkedCounter++;
      }
    }

    return checkedCounter;
  }
}

