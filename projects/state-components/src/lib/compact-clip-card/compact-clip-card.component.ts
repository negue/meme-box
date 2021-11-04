import {Component, Input, OnInit} from '@angular/core';
import {Action} from "@memebox/contracts";

@Component({
  selector: 'app-compact-clip-card',
  templateUrl: './compact-clip-card.component.html',
  styleUrls: ['./compact-clip-card.component.scss']
})
export class CompactClipCardComponent implements OnInit {

  @Input()
  public clip: Action;

  constructor() { }

  ngOnInit(): void {
  }

}
