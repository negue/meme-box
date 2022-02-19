import {Pipe, PipeTransform} from '@angular/core';
import groupBy from 'lodash/groupBy';
import {FilterTypes, IFilterItem} from "./filter.component";

export interface FilterTypeGroup {
  groupName: string;
  filterType: FilterTypes;
  filterChips: IFilterItem[];
}

const FILTER_LABEL: {[key: string]: string} = {
  [FilterTypes.Tags]: 'Tags',
  [FilterTypes.ActionTypes]: 'Action Types',
  [FilterTypes.Screens]: 'Screens',
  [FilterTypes.Misc]: 'Misc.',
}

@Pipe({
  name: 'groupByType'
})
export class GroupByTypePipe implements PipeTransform {

  transform(filterItems: IFilterItem[]): FilterTypeGroup[] {
    if (filterItems === null || filterItems.length === 0) {
      return [];
    }

    const groups = groupBy(filterItems, f => f.type);

    return Object.keys(groups).map(filterType => {
      const filterChips = groups[filterType];
      return {
        groupName: FILTER_LABEL[filterType],
        filterType: filterType as FilterTypes,
        filterChips
      };
    });
  }

}
