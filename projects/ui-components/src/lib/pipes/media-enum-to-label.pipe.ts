import {Pipe, PipeTransform} from '@angular/core';
import {MEDIA_TYPE_INFORMATION, MediaType} from "@memebox/contracts";
import {TranslocoService} from "@ngneat/transloco";
import {take} from "rxjs/operators";

@Pipe({
  name: 'mediaEnumToLabel'
})
export class MediaEnumToLabel implements PipeTransform {

    constructor(
      private transloco: TranslocoService
    ) {
    }

  async transform(media: MediaType): Promise<string> {
    const informationByType = MEDIA_TYPE_INFORMATION[media];

    console.info('transform called', {
      media,informationByType
    });

     const translatedString = await this.transloco.selectTranslate(
       informationByType.translationKey, {}, {
         scope: 'common'
       }).pipe(
         take(1)
     ).toPromise();

     console.info({
       translatedString
     });

    return translatedString ?? informationByType.labelFallback;
  }
}
