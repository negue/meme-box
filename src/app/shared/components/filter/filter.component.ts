import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MEDIA_TYPE_INFORMATION} from "@memebox/contracts";

export interface IFilterItem {
  label: string;
  icon: string;
  type: any;
  value: any; // todo change to generic?
}

export const MEDIA_FILTER_TYPE = 'MEDIA_TYPE';

export const TYPE_FILTER_ITEMS: IFilterItem[] = Object.entries(MEDIA_TYPE_INFORMATION)
  .map(([mediaType, informations]) => {
    return {
      label: informations.label,
      value: +mediaType,
      icon: informations.icon,
      type:MEDIA_FILTER_TYPE
    } as IFilterItem;
  });

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
