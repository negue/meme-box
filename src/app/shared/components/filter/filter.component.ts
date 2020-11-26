import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MEDIA_TYPE_INFORMATION} from "@memebox/contracts";
import orderBy from 'lodash/orderBy';

export interface IFilterItem {
  label: string;
  icon: string;
  type: any; // string type to see / filter what kind of filter-item-type it is
  value: any; // todo change to generic?
}

export const MEDIA_FILTER_TYPE = 'MEDIA_TYPE';

export const TYPE_FILTER_ITEMS: IFilterItem[] = orderBy(Object.entries(MEDIA_TYPE_INFORMATION)
  .map(([mediaType, informations]) => {
    return {
      label: informations.label,
      value: +mediaType,
      icon: informations.icon,
      type:MEDIA_FILTER_TYPE,
      sortOrder: informations.sortOrder
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

  public selectedArray: IFilterItem[] = [];


  constructor() { }

  ngOnInit(): void {
  }

  toggleFilter(item: IFilterItem) {
    if (this.selectedArray.includes(item)) {
      var indexOfItem = this.selectedArray.indexOf(item);

      this.selectedArray.splice(indexOfItem, 1);
    } else {
      this.selectedArray.push(item);
    }

    this.selected.emit(this.selectedArray);
  }
}
