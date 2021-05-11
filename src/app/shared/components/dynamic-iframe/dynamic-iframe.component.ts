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
import {BehaviorSubject, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {WidgetApi} from "./widget-api";
import {TriggerClip} from "@memebox/contracts";

@Component({
  selector: 'app-dynamic-iframe',
  templateUrl: './dynamic-iframe.component.html',
  styleUrls: ['./dynamic-iframe.component.scss']
})
export class DynamicIframeComponent implements OnInit, OnChanges, OnDestroy {
  private wsHandler: WebsocketHandler;
  private _destroy$ = new Subject();
  private _widgetApi: WidgetApi;

  @ViewChild('targetIframe', {static: true})
  targetIframe: ElementRef<HTMLIFrameElement>;

  @Input()
  content: DynamicIframeContent;

  @Output()
  load = new EventEmitter();

  errorSubject$ = new BehaviorSubject<string>('');


  constructor() {
    this.wsHandler = new WebsocketHandler(AppConfig.wsBase+'/ws/twitch_events', 3000);

    this._widgetApi = new WidgetApi(this.wsHandler, this.errorSubject$);
  }

  ngOnInit(): void {
    this.targetIframe.nativeElement.contentWindow.onerror = (event : string) => {
      this.errorSubject$.next(event);
      console.error(event);
      return false;
    };

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

  public componentIsShown(currentTriggeredPayload: TriggerClip) {
    this._widgetApi.triggerIsShown(currentTriggeredPayload);
  }

  private handleContentUpdate() {
    if (this.content) {
      // yes, as any, because we need to add a property to it
      const iframeWindow = this.targetIframe.nativeElement.contentWindow as any;

      iframeWindow.widget = this._widgetApi;

      dynamicIframe(this.targetIframe.nativeElement, this.content);

      this.errorSubject$.next('');

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
