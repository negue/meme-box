import {Pipe, PipeTransform} from '@angular/core';
import {Action, ACTION_TYPE_INFORMATION, ActionType} from '@memebox/contracts';
import groupBy from 'lodash/groupBy';

export interface ActionTypeGroup {
  groupName: string;
  mediaType: ActionType;
  medias: Action[];
}

@Pipe({
  name: 'groupByMediaType'
})
export class GroupByMediaTypePipe implements PipeTransform {

  transform(medias: Action[]): ActionTypeGroup[] {
    if (medias === null || medias.length === 0) {
      return [];
    }

    const validTypes = Object.values(ActionType);

    const groups = groupBy(medias, m => validTypes.includes(m.type) ? m.type : ActionType.Invalid);

    return Object.keys(groups).map(gKey => {
      const mediaType = groups[gKey][0].type;

      return {
        mediaType,
        groupName: ACTION_TYPE_INFORMATION[mediaType]?.translationKey ?? 'invalid',
        medias: groups[gKey]
      };
    });
  }

}
