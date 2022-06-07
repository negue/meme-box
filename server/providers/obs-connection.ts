import { Service, UseOpts } from "@tsed/di";
import { Inject } from "@tsed/common";
import { PERSISTENCE_DI } from "./contracts";
import { Persistence } from "../persistence";
import OBSWebSocket from "obs-websocket-js";
import { NamedLogger } from "./named-logger";
import { timeoutAsync } from "./actions/scripts/apis/sleep.api";
import { ObsConfig } from "@memebox/contracts";
import { ConnectionsStateHub, UpdateStateFunc } from "./connections-state.hub";
import { fromEventPattern, Subject } from "rxjs";

export function onWsEvent$(ws: OBSWebSocket, type: string) {
  return fromEventPattern(
    // @ts-expect-error because the .raw.on needs a specific union type
    handler => ws.on(type, handler),
    handler => ws.off(type, handler)
  );
}

@Service()
export class ObsConnection {
  private obsConfig: ObsConfig;
  private obsConnection = new OBSWebSocket();
  private obsConnectionState: UpdateStateFunc;
  private isConnected = false;

  public readonly obsConfigExists: boolean;

  public onConnected$ = new Subject();
  public isConnectedAsync = this.onConnected$.asObservable().toPromise();

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    @UseOpts({name: 'ObsConnection'}) public logger: NamedLogger,
    connectionStateHub: ConnectionsStateHub,
  ) {
    this.obsConnectionState = connectionStateHub.registerService({
      name: 'OBS Connection'
    });
    this.obsConfig = _persistence.getConfig(false).obs;

    this.obsConfigExists = !!this.obsConfig?.hostname;

    this.obsConnection.on('ConnectionOpened', () => {
      this.isConnected = true;
      this.onConnected$.next();

      this.obsConnection.once('ConnectionClosed', () => {
        this.isConnected = false;
      })
    });

    this._persistence.dataUpdated$().subscribe(
      async value => {
        if (value.dataType === "settings") {
          if (this.isObsConnected()) {
            this.logger.error(`Can't change the OBS while is already connected. You need to restart.`);

            return;
          }

          const previousConfig = this.obsConfig;
          const newConfig = _persistence.getConfig(false).obs;

          if (
            previousConfig.hostname == newConfig.hostname
          && previousConfig.password == newConfig.password
          ) {
            return;
          }

          this.obsConfig = newConfig;

          this.obsConnectionState({
            label: 'New Configuration Received',
          });

          await this.connectIfNot();
        }
      }
    )
  }

  async getCurrentConnection() : Promise<OBSWebSocket> {
    try {
      await this.connectIfNot();
      // eslint-disable-next-line no-empty
    } catch (e) { }

    return this.obsConnection
  }

  private tryReconnectingIsRunning = false;

  async tryConnecting() {
    if (this.tryReconnectingIsRunning) {
      return await this.isConnectedAsync;
    }

    this.tryReconnectingIsRunning = true;

    let lastError;
    for (let i = 0; i<5;i++) {
      try {
        await this.connectIfNot();
        this.logger.info('Connected to OBS');

        return;
      }
      catch (e) {
        const timeoutToTryAgain = (i+1) * 3000;
        lastError = e;

        this.logger.info(`Could not connect to OBS, retrying in ${timeoutToTryAgain}ms`);

        await timeoutAsync(timeoutToTryAgain)
      }
    }

    this.tryReconnectingIsRunning = false;
    this.logger.error(lastError, 'Could not connect to OBS');
  }

  async newConnection(hostname: string, password?: string) : Promise<OBSWebSocket> {
    const obsConnection = new OBSWebSocket();
    await this.obsConnection.connect({
      address: hostname,
      password: password
    });

    return obsConnection;
  }

  private connectionPromise: Promise<unknown>;

  async connectIfNot () {
    if (this.connectionPromise) {
      await this.connectionPromise;
    }

    const isConnected = this.isObsConnected();

    if (!isConnected) {
      this.connectionPromise = this.createConnectionPromise();

      await this.connectionPromise;

      this.obsConnectionState({
        label: 'Connected'
      });
    }
  }

  private isObsConnected () {
    return this.isConnected;
  }

  private async createConnectionPromise() {
    if (!this.obsConfigExists) {
      return;
    }

    this.obsConnectionState({
      label: 'Connecting'
    });

    await this.obsConnection.connect({
      address: this.obsConfig?.hostname,
      password: this.obsConfig?.password
    }, error => {
      if (error) {
        this.logger.error(error, 'OBS WS')
        this.obsConnectionState({
          label: 'Error',
          description: error.message
        });
      }
    });
  }
}

