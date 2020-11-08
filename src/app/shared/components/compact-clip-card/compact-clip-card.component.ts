import {Component, Input, OnInit} from '@angular/core';
import {Clip} from "@memebox/contracts";

@Component({
  selector: 'app-compact-clip-card',
  templateUrl: './compact-clip-card.component.html',
  styleUrls: ['./compact-clip-card.component.scss']
})
export class CompactClipCardComponent implements OnInit {

  @Input()
  public clip: Clip;

  constructor() { }

  ngOnInit(): void {
  }

}
