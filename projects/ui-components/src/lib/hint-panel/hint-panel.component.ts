import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-hint-panel',
  templateUrl: './hint-panel.component.html',
  styleUrls: ['./hint-panel.component.scss']
})
export class HintPanelComponent implements OnInit {

  @Input()
  @HostBinding('class.add-bottom-padding')
  public addBottomPadding = true;

  constructor() { }

  ngOnInit(): void {
  }

}
