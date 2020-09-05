import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview-add-item',
  templateUrl: './overview-add-item.component.html',
  styleUrls: ['./overview-add-item.component.scss']
})
export class OverviewAddItemComponent implements OnInit {

  @Input()
  public label = '';

  constructor() { }

  ngOnInit(): void {
  }

}
