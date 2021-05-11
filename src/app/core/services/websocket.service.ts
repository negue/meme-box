import {Injectable} from '@angular/core';
import {ACTIONS, TriggerClip} from "@memebox/contracts";
import {BehaviorSubject, Subject} from "rxjs";
import {SnackbarService} from "./snackbar.service";
import {AppConfig} from "@memebox/app/env";


console.warn('WEBSOCKET - AppConfig', AppConfig);

export enum ConnectionState{
  NONE,
  Disconnected,
  Connected,
  Reconnecting,
  Error,
  Offline
}

// TODO Refactor

@Injectable()
export class WebsocketService {
  public onOpenConnection$ = new Subject();
  public onReconnection$ = new Subject();
  public onUpdateData$ = new Subject();
  public onReloadScreen$ = new Subject();
  public onTriggerClip$ = new Subject<TriggerClip>();
  public connectionState$ = new BehaviorSubject<ConnectionState>(ConnectionState.NONE)

  private ws: WebSocket;
  private firstConnectionWorked = true;
  private isConnected = false;
  private intervalId = 0;
  private allowReconnections = true;

  constructor(private snackbar: SnackbarService) {
    setTimeout(() => this.connect(), 150);
  }

  public sendI_Am_OBS(guid: string) {
    this.ws.send(`${ACTIONS.I_AM_OBS}=${guid}`);
  }

  public sendWidgetRegistration(mediaId: string, widgetInstance: string, register: boolean) {

    const action = register ? ACTIONS.REGISTER_WIDGET_INSTANCE : ACTIONS.UNREGISTER_WIDGET_INSTANCE;

    const payload = `${mediaId}|${widgetInstance}`;

    this.ws.send(`${action}=${payload}`);
  }

  public triggerClipOnScreen(clipId: string, screenId?: string | null) {
    const triggerObj: TriggerClip = {
      id: clipId,
      targetScreen: screenId,
      repeatX: 0,  // todo after streamdeck ?
      repeatSecond: 0,
    }

    this.ws.send(`${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(triggerObj)}`);
    this.snackbar.normal(`Triggered clip.`);
  }

  public triggerReloadScreen(screenId: string | null) {
    this.ws.send(`${ACTIONS.RELOAD_SCREEN}=${screenId}`);
  }


  private onMessage(event: MessageEvent) {
    console.debug("WebSocket message received:", event);

    const dataAsString = event.data as string;

    // console.error({dataAsString});

    const [action, payload] = dataAsString.split('=');

    switch (action) {
      case ACTIONS.TRIGGER_CLIP: {
        const payloadObj: TriggerClip = JSON.parse(payload);

        this.onTriggerClip$.next(payloadObj);

        break;
      }
      case ACTIONS.UPDATE_DATA: {
        this.onUpdateData$.next();
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
      console.warn('already isConnected!');
      return;
    }

    if (this.ws && this.ws.readyState === this.ws.CONNECTING) {
      console.info('Still connecting, WAIT');
      return;
    }

    console.info('Creating a new WS connection, fingers crossed');

    if (this.ws) {
      // free up memory?
      delete this.ws;
      this.ws = null;
    }

    if (this.intervalId !== 0) {
      clearInterval(this.intervalId);
      this.intervalId = 0;
    }

    this.connectionState$.next(ConnectionState.Reconnecting);

    this.ws = new WebSocket(AppConfig.wsBase);

    this.ws.onopen = ev => {
      this.isConnected = true;
      this.onOpenConnection$.next();
      this.connectionState$.next(ConnectionState.Connected);

      if (!this.firstConnectionWorked) {
        this.onReconnection$.next();
      }
    };

    this.ws.onerror = ev => {
      console.warn('On Error', ev);
      this.isConnected = false;
    };

    this.ws.onclose = ev => {
      console.warn('On Close', ev);
      this.isConnected = false;
      this.firstConnectionWorked = false;

      this.connectionState$.next(ConnectionState.Disconnected);

      if (this.intervalId === 0) {
        if (this.allowReconnections) {
          this.intervalId = window.setInterval(() => {
            this.connect();
          }, 2000);
          console.warn('new ws connect interval', this.intervalId);
        } else {
          this.connectionState$.next(ConnectionState.Offline);
        }
      }
    };

    this.ws.onmessage = event => {
      this.onMessage(event);
    };
  }

  stopReconnects() {
    this.allowReconnections = false;
  }
}
