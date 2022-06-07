import {Pipe, PipeTransform} from '@angular/core';
import {ACTION_TYPE_INFORMATION, ActionType} from "@memebox/contracts";
import {TranslocoService} from "@ngneat/transloco";
import {take} from "rxjs/operators";

@Pipe({
  name: 'actionEnumToLabelAsync'
})
export class ActionEnumToLabelPipe implements PipeTransform {

    constructor(
      private transloco: TranslocoService
    ) {
    }

  async transform(media: ActionType): Promise<string> {
    const informationByType = ACTION_TYPE_INFORMATION[media];



     const translatedString = await this.transloco.selectTranslate(
       informationByType.translationKey, {}, {
         scope: 'common'
       }).pipe(
         take(1)
     ).toPromise();



    return translatedString ?? informationByType.labelFallback;
  }
}
