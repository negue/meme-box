import {Action} from "../../../contracts/src/lib/types";
import orderBy from 'lodash/orderBy';
import {getSortOrderByType} from "../../../contracts/src/lib/media.types";

export function sortClips(clips: Action[]) {
  return orderBy(clips, [c => getSortOrderByType(c.type), 'name'])
}
