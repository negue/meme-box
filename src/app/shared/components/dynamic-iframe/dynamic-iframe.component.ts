import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {dynamicIframe, DynamicIframeContent} from "@memebox/utils";
import {WebsocketHandler} from "../../../core/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-dynamic-iframe',
  templateUrl: './dynamic-iframe.component.html',
  styleUrls: ['./dynamic-iframe.component.scss']
})
export class DynamicIframeComponent implements OnInit, OnChanges, OnDestroy {
  private wsHandler: WebsocketHandler;
  private _destroy$ = new Subject();

  @ViewChild('targetIframe', {static: true})
  targetIframe: ElementRef<HTMLIFrameElement>;

  @Input()
  content: DynamicIframeContent;

  @Output()
  load = new EventEmitter();

  constructor() {
    this.wsHandler = new WebsocketHandler(AppConfig.wsBase+'/ws/twitch_events', 3000);
  }

  ngOnInit(): void {
    this.handleContentUpdate();

    this.wsHandler.onMessage$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(twitchEvent => {
      console.info({twitchEvent});
      this.targetIframe.nativeElement.contentWindow.postMessage(twitchEvent, '*');
    });

    this.load.emit();
  }
  ngOnDestroy() {
    this._destroy$.next();
  }

  ngOnChanges({content}: SimpleChanges): void {
    if(content) {
      console.warn('UPDATING IFRAME');
      this.handleContentUpdate();
    }
  }

  private handleContentUpdate() {
    if (this.content) {
      dynamicIframe(this.targetIframe.nativeElement, this.content);

      if (this.content.settings) {
        if (this.content.settings.subscribeToTwitchEvent) {
          this.wsHandler.connect();
        } else {
          this.wsHandler.stopReconnects();
        }
      }
    }
  }
}
