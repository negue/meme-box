import {BehaviorSubject, Subject} from "rxjs";

export enum ConnectionState{
  NONE,
  Disconnected,
  Connected,
  Reconnecting,
  Error,
  Offline
}

export class WebsocketHandler {
  public onOpenConnection$ = new Subject();
  public onReconnection$ = new Subject();
  public connectionState$ = new BehaviorSubject<ConnectionState>(ConnectionState.NONE)

  public onMessage$ = new Subject<string>();

  private ws?: WebSocket|null;
  private firstConnectionWorked = true;
  private isConnected = false;
  private intervalId = 0;
  private allowReconnections = true;

  constructor(
    private wsUrl: string,
    private reconnectTimeout: number
  ) {
  }

  private onMessage(event: MessageEvent) {
    this.onMessage$.next(event.data);
  }

  public connect() {
    if (this.isConnected) {
      console.warn('already isConnected!');
      return;
    }

    if (this.ws && this.ws.readyState === this.ws.CONNECTING) {
      console.info('Still connecting, WAIT');
      return;
    }

    console.info('Creating a new WS connection, fingers crossed', this.wsUrl);

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

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = ev => {
      this.isConnected = true;
      this.onOpenConnection$.next();
      this.connectionState$.next(ConnectionState.Connected);

      if (!this.firstConnectionWorked) {
        this.onReconnection$.next();
      }
    };

    this.ws.onerror = ev => {
      this.isConnected = false;
    };

    this.ws.onclose = ev => {
      this.isConnected = false;
      this.firstConnectionWorked = false;

      this.connectionState$.next(ConnectionState.Disconnected);

      if (this.intervalId === 0) {
        if (this.allowReconnections) {
          this.intervalId = window.setInterval(() => {
            this.connect();
          }, this.reconnectTimeout);
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
    this.ws?.close();
    this.allowReconnections = false;
  }
}
