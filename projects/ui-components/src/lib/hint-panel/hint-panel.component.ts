import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-hint-panel',
  templateUrl: './hint-panel.component.html',
  styleUrls: ['./hint-panel.component.scss']
})
export class HintPanelComponent {

  @Input()
  @HostBinding('class.add-bottom-padding')
  public addBottomPadding = false;
}
