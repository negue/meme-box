import {Component, Input, OnInit} from '@angular/core';
import {Action, ActionType, ScreenClip} from "@memebox/contracts";

@Component({
  selector: 'app-action-preview',
  templateUrl: './action-preview.component.html',
  styleUrls: ['./action-preview.component.scss']
})
export class ActionPreviewComponent implements OnInit {

  @Input()
  public iconSize: string;


  @Input()
  public height: string;

  @Input()
  public width: string;

  @Input()
  public action: Action;

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
