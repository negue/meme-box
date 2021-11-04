import {Component, Input, OnInit} from '@angular/core';
import {Action, ActionType, ScreenClip} from "@memebox/contracts";

@Component({
  selector: 'app-clip-preview',
  templateUrl: './clip-preview.component.html',
  styleUrls: ['./clip-preview.component.scss']
})
export class ClipPreviewComponent implements OnInit {

  @Input()
  public height: string;

  @Input()
  public width: string;

  @Input()
  public clip: Action;

  @Input()
  public setting: ScreenClip;

  @Input()
  public showIframe = true;

  @Input()
  public useOldPathEndpoint = false;

  constructor() { }

  ngOnInit(): void {
  }

  get MediaType() {
    return ActionType;
  }
}
