import {Component, EventEmitter, Input, OnInit, Output, TrackByFunction} from '@angular/core';
import {ACTION_TYPE_INFORMATION_ARRAY} from "@memebox/contracts";
import orderBy from 'lodash/orderBy';
import {isItemTheSame} from "./is-selected.pipe";

export interface IFilterItem {
  label: string;
  icon: string;
  type: any; // string type to see / filter what kind of filter-item-type it is
  value: any; // todo change to generic?
  translateLabel?: boolean;
  sortOrder?: number;
}

export const MEDIA_FILTER_TYPE = 'MEDIA_TYPE';

export const TYPE_FILTER_ITEMS: IFilterItem[] = orderBy(ACTION_TYPE_INFORMATION_ARRAY
  .map((informations) => {

    return {
      label: informations.translationKey,
      value: +informations.mediaType,
      icon: informations.icon,
      type:MEDIA_FILTER_TYPE,
      sortOrder: informations.sortOrder,
      translateLabel: true,
    } as IFilterItem;
  }), 'sortOrder');

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input()
  public items: IFilterItem[] = [];

  @Output()
  public selected = new EventEmitter<IFilterItem[]>();

  @Input()
  public selectedArray: IFilterItem[] = [];

  trackByFilterItem: TrackByFunction<IFilterItem> = (index, item) => {
    return item.type+item.value;
  };


  constructor() { }

  ngOnInit(): void {
  }

  toggleFilter(item: IFilterItem) {
    if (this.selectedArray.some(isItemTheSame(item))) {
      var indexOfItem = this.selectedArray.findIndex(isItemTheSame(item));

      this.selectedArray.splice(indexOfItem, 1);
    } else {
      this.selectedArray.push(item);
    }

    this.selected.emit(this.selectedArray);
  }

  clearFilter($event: MouseEvent) {
    $event.stopPropagation();

    this.selectedArray.splice(0, this.selectedArray.length);
    this.selected.emit(this.selectedArray);
  }
}
