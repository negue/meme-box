import {Action} from "@memebox/contracts";
import orderBy from 'lodash/orderBy';
import {getSortOrderByType} from "@memebox/contracts";

export function sortClips(clips: Action[]) {
  return orderBy(clips, [c => getSortOrderByType(c.type), 'name'])
}
