import { Pipe, PipeTransform } from '@angular/core';
import { IFilterItem } from "./filter.component";

export function isItemTheSame (item: IFilterItem) {
  return (differentItem: IFilterItem): boolean  => {
    return item.type === differentItem.type
      && item.value === differentItem.value
  }
}

@Pipe({
  name: 'isSelected',
  // skipcq: JS-0575
  pure: false   // pure false is needed since the list is not changing the reference, only the items inside
})
export class IsSelectedPipe implements PipeTransform {
  transform(item: IFilterItem, list: IFilterItem[]): boolean {
    return list.some(isItemTheSame(item));
  }
}

