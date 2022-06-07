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
import { dynamicIframe, DynamicIframeContent } from "@memebox/utils";
import { WebsocketHandler } from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import { AppConfig } from "@memebox/app/env";
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { WidgetApi } from "./widget-api";
import { TriggerAction, WEBSOCKET_PATHS } from "@memebox/contracts";
import { AppService, MemeboxWebsocketService } from "@memebox/app-state";
import { guid } from "@datorama/akita";
import { WidgetStoreRemoteAdapter } from "./widget-store-remote-adapter.service";

@Component({
  selector: 'app-dynamic-iframe',
  templateUrl: './dynamic-iframe.component.html',
  styleUrls: ['./dynamic-iframe.component.scss']
})
export class DynamicIframeComponent implements OnInit, OnChanges, OnDestroy {
  private wsHandler: WebsocketHandler;
  private _destroy$ = new Subject();
  private _widgetApi: WidgetApi;
  private _widgetInstance = guid();
  private _onErrorHandlerAttached = false;

  @ViewChild('targetIframe', {static: true})
  targetIframe: ElementRef<HTMLIFrameElement>;

  @Input()
  mediaId: string;

  @Input()
  content: DynamicIframeContent;

  @Output()
  public readonly iframeLoaded = new EventEmitter();

  errorSubject$ = new BehaviorSubject<string>('');

  constructor(private websocket: MemeboxWebsocketService,
              private appService: AppService,
              private remoteStoreApiAdapter: WidgetStoreRemoteAdapter) {
    this.wsHandler = new WebsocketHandler(AppConfig.wsBase+WEBSOCKET_PATHS.TWITCH_EVENTS, 3000);

  }

  async ngOnInit(): Promise<void> {
    const currentWidgetApi = new WidgetApi(this.mediaId, this._widgetInstance, this.remoteStoreApiAdapter, this.wsHandler, this.errorSubject$);

    await Promise.all([
      currentWidgetApi.isReady(),
      this.websocket.isReady()
    ]);

    this._widgetApi =currentWidgetApi;
    this.websocket.sendWidgetRegistration(this.mediaId, this._widgetInstance, true);

    this.attachOnError();

    this.handleContentUpdate();

    this.wsHandler.onMessage$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(twitchEvent => {
      console.info({twitchEvent});
      this.targetIframe.nativeElement.contentWindow.postMessage(twitchEvent, '*');
    });

    this.iframeLoaded.emit();

  }

  ngOnDestroy() {
    this._destroy$.next();

    this.websocket.sendWidgetRegistration(this.mediaId, this._widgetInstance, false);
  }

  ngOnChanges({content}: SimpleChanges): void {
    if(content) {
      console.warn('UPDATING IFRAME');
      this.handleContentUpdate();
    }
  }

  public get WidgetApi() {
    return this._widgetApi;
  }

  public componentIsShown(currentTriggeredPayload: TriggerAction) {
    this._widgetApi.triggerIsShown(currentTriggeredPayload);
  }

  public handleContentUpdate() {
    if (this.content && this._widgetApi) {
      // yes, as any, because we need to add a property to it
      const iframeWindow = this.targetIframe.nativeElement.contentWindow as any;


      if (iframeWindow) {
        iframeWindow.widget = this._widgetApi;
      }

      this.attachOnError();

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

  private attachOnError () {
    if (this._onErrorHandlerAttached || !this.targetIframe?.nativeElement?.contentWindow) {
      return;
    }

    this.targetIframe.nativeElement.contentWindow.onerror = (event : string) => {
      this.errorSubject$.next(event);
      console.error(event);
      return false;
    };

    this._onErrorHandlerAttached = true;
  }
}
