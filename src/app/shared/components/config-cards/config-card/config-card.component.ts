import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-config-card',
  templateUrl: './config-card.component.html',
  styleUrls: ['./config-card.component.scss']
})
export class ConfigCardComponent {

  @Input()
  public title : string;

  @Input()
  public icon: string;

  @Input()
  public titlePadding = true;
}
