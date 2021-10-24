import {Pipe, PipeTransform} from '@angular/core';
import {Clip, MEDIA_TYPE_INFORMATION, MediaType} from '@memebox/contracts';
import groupBy from 'lodash/groupBy';

export interface ActionTypeGroup {
  groupName: string;
  mediaType: MediaType;
  medias: Clip[];
}

@Pipe({
  name: 'groupByMediaType'
})
export class GroupByMediaTypePipe implements PipeTransform {

  transform(medias: Clip[]): ActionTypeGroup[] {
    if (medias === null || medias.length === 0) {
      return [];
    }

    const validTypes = Object.values(MediaType);

    const groups = groupBy(medias, m => validTypes.includes(m.type) ? m.type : MediaType.Invalid);

    return Object.keys(groups).map(gKey => {
      const mediaType = groups[gKey][0].type;

      return {
        mediaType,
        groupName: MEDIA_TYPE_INFORMATION[mediaType]?.translationKey ?? 'invalid',
        medias: groups[gKey]
      };
    });
  }

}
