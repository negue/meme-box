import {Component, EventEmitter, Input, Output, TrackByFunction} from '@angular/core';
import {ACTION_TYPE_INFORMATION_ARRAY} from "@memebox/contracts";
import orderBy from 'lodash/orderBy';
import {isItemTheSame} from "./is-selected.pipe";

export const enum FilterTypes {
  ActionTypes = 'ACTION_TYPE',
  Tags = 'TAG',
  Screens = 'SCREEN',
  Misc = 'MISC'
}

export interface IFilterItem {
  label: string;
  icon: string;
  type: FilterTypes
  value: any; // todo change to generic?
  translateLabel?: boolean;
  sortOrder?: number;
}

export const TYPE_FILTER_ITEMS: IFilterItem[] = orderBy(ACTION_TYPE_INFORMATION_ARRAY
  .map((informations) => {

    return {
      label: informations.translationKey,
      value: +informations.actionType,
      icon: informations.icon,
      type:FilterTypes.ActionTypes,
      sortOrder: informations.sortOrder,
      translateLabel: true,
    } as IFilterItem;
  }), 'sortOrder');

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input()
  public items: IFilterItem[] = [];

  @Output()
  public readonly selected = new EventEmitter<IFilterItem[]>();

  @Output()
  public readonly searchChanged = new EventEmitter<string>();

  @Input()
  public selectedArray: IFilterItem[] = [];

  public searchText = '';

  trackByFilterItem: TrackByFunction<IFilterItem> = (index, item) => {
    return item.type+item.value;
  };

  toggleFilter(item: IFilterItem): void  {
    if (this.selectedArray.some(isItemTheSame(item))) {
      const indexOfItem = this.selectedArray.findIndex(isItemTheSame(item));

      this.selectedArray.splice(indexOfItem, 1);
    } else {
      this.selectedArray.push(item);
    }

    this.selected.emit(this.selectedArray);
  }

  clearFilter($event: MouseEvent): void  {
    $event.stopPropagation();

    this.selectedArray.splice(0, this.selectedArray.length);
    this.selected.emit(this.selectedArray);
  }

  updateSearchField(value: string): void  {
    this.searchText = value;
    this.searchChanged.next(value);
  }
}
