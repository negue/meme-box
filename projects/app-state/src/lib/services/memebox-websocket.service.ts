import {Inject, Injectable, InjectionToken} from '@angular/core';
import {
  ActionActiveStatePayload,
  ACTIONS,
  ActionStateEnum,
  ChangedInfo,
  TriggerAction,
  TriggerActionOrigin,
  TriggerActionOverrides
} from "@memebox/contracts";
import {BehaviorSubject, Subject} from "rxjs";
import {SnackbarService} from "./snackbar.service";
import {filter, mapTo, take} from "rxjs/operators";
import {uuid} from "@gewd/utils";

export enum ConnectionStateEnum {
  NONE,
  Disconnected,
  Connected,
  Reconnecting,
  Error,
  Offline
}

// TODO Refactor


export const WebSocketBasePathInjectionToken
  = new InjectionToken<string>('WebSocketBasePathInjectionToken');

@Injectable({
  providedIn: 'root'
})
export class MemeboxWebsocketService {
  public onOpenConnection$ = new Subject();
  public onReconnection$ = new Subject();
  public onUpdateData$ = new Subject<ChangedInfo>();
  public onReloadScreen$ = new Subject();
  public onTriggerAction$ = new Subject<TriggerAction>();
  public onUpdateMedia$ = new Subject<TriggerAction>();
  public connectionState$ = new BehaviorSubject<ConnectionStateEnum>(ConnectionStateEnum.NONE)

  private ws?: WebSocket | null = null;
  private firstConnectionWorked = true;
  private isConnected = false;
  private intervalId = 0;
  private allowReconnections = true;

  constructor(private snackbar: SnackbarService,
              @Inject(WebSocketBasePathInjectionToken)
              readonly wsBasePath: string) {
    setTimeout(() => this.connect(), 150);
  }

  public sendI_Am_OBS(guid: string): void  {
    this.sendToTheSocket(`${ACTIONS.I_AM_OBS}=${guid}`);
  }

  public sendI_Am_MANAGE(): void  {
    this.sendToTheSocket(ACTIONS.I_AM_MANAGE);
  }

  public sendWidgetRegistration(mediaId: string, widgetInstance: string, register: boolean): void  {

    const action = register ? ACTIONS.REGISTER_WIDGET_INSTANCE : ACTIONS.UNREGISTER_WIDGET_INSTANCE;

    const payload = `${mediaId}|${widgetInstance}`;

    this.sendToTheSocket(`${action}=${payload}`);
  }

  public updateMediaState(mediaId: string, screenId: string, showing: boolean): void  {
    const triggerObj: ActionActiveStatePayload = {
      mediaId,
      screenId,
      state: showing ? ActionStateEnum.Active : ActionStateEnum.Done,
      overrides: null // maybe sent the current state here too?
    };

    this.sendToTheSocket(`${ACTIONS.MEDIA_STATE}=${JSON.stringify(triggerObj)}`);
  }

  public triggerClipOnScreen(clipId: string,
                             screenId?: string | undefined,
                             overrides?: TriggerActionOverrides): void  {
    const triggerObj: TriggerAction = {
      id: clipId,
      uniqueId: uuid(),
      targetScreen: screenId,
      repeatX: 0,  // todo after streamdeck ?
      repeatSecond: 0,

      origin: TriggerActionOrigin.AppPreview,
      overrides
    }

    this.sendToTheSocket(`${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(triggerObj)}`);
    this.snackbar.normal(`Triggered clip.`);
  }


  private onMessage(event: MessageEvent) {


    const dataAsString = event.data as string;

    // console.error({dataAsString});

    const [action, payload] = dataAsString.split('=');

    switch (action) {
      case ACTIONS.TRIGGER_CLIP: {
        const payloadObj: TriggerAction = JSON.parse(payload);

        this.onTriggerAction$.next(payloadObj);

        break;
      }
      case ACTIONS.UPDATE_MEDIA: {
        const payloadObj: TriggerAction = JSON.parse(payload);

        this.onUpdateMedia$.next(payloadObj);

        break;
      }
      case ACTIONS.UPDATE_DATA: {
        const payloadObj: ChangedInfo = JSON.parse(payload);

        this.onUpdateData$.next(payloadObj);
        break;
      }
      case ACTIONS.RELOAD_SCREEN: {
        this.onReloadScreen$.next();
        break;
      }
    }
  }

  private connect() {
    if (this.isConnected) {

      return;
    }

    if (this.ws && this.ws.readyState === this.ws.CONNECTING) {

      return;
    }



    if (this.ws) {
      // free up memory?
      delete this.ws;
      this.ws = null;
    }

    if (this.intervalId !== 0) {
      clearInterval(this.intervalId);
      this.intervalId = 0;
    }

    this.connectionState$.next(ConnectionStateEnum.Reconnecting);

    this.ws = new WebSocket(this.wsBasePath);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.onOpenConnection$.next();
      this.connectionState$.next(ConnectionStateEnum.Connected);

      if (!this.firstConnectionWorked) {
        this.onReconnection$.next();
      }
    };

    this.ws.onerror = () => {
      this.isConnected = false;
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.firstConnectionWorked = false;

      this.connectionState$.next(ConnectionStateEnum.Disconnected);

      if (this.intervalId === 0) {
        if (this.allowReconnections) {
          this.intervalId = window.setInterval(() => {
            this.connect();
          }, 2000);

        } else {
          this.connectionState$.next(ConnectionStateEnum.Offline);
        }
      }
    };

    this.ws.onmessage = event => {
      this.onMessage(event);
    };
  }

  stopReconnects(): void  {
    this.allowReconnections = false;
  }

  isReady() : Promise<boolean> {
    return this.connectionState$.pipe(
      filter(connectionState => connectionState === ConnectionStateEnum.Connected),
      take(1),
      mapTo(true)
    ).toPromise();
  }

  sendToTheSocket(data: string): void  {
    this.ws?.send(data);
  }
}
