import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overview-add-item',
  templateUrl: './overview-add-item.component.html',
  styleUrls: ['./overview-add-item.component.scss']
})
export class OverviewAddItemComponent {

  @Input()
  public label = '';
}
