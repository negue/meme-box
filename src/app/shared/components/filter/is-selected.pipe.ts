import {Pipe, PipeTransform} from '@angular/core';
import {IFilterItem} from "./filter.component";

@Pipe({
  name: 'isSelected',
  pure: true
})
export class IsSelectedPipe implements PipeTransform {

  transform(item: IFilterItem, list: IFilterItem[]): boolean {
    return list.some(isItemTheSame(item));
  }

}

export function isItemTheSame (item: IFilterItem) {
  return (differentItem: IFilterItem): boolean  => {
    return item.type === differentItem.type
      && item.value === differentItem.value
  }
}
