import {Action, getSortOrderByType} from "@memebox/contracts";
import orderBy from 'lodash/orderBy';

export function sortActions(clips: Action[]) {
  return orderBy(clips, [c => getSortOrderByType(c.type), 'name'])
}
