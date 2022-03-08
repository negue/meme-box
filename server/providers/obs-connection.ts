import {Service, UseOpts} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {Persistence} from "../persistence";
import OBSWebSocket from "obs-websocket-js";
import {NamedLogger} from "./named-logger";
import {timeoutAsync} from "./actions/scripts/apis/sleep.api";
import {ObsConfig} from "@memebox/contracts";
import {ConnectionsStateHub, UpdateStateFunc} from "./connections-state.hub";

@Service()
export class ObsConnection {
  private obsConfig: ObsConfig;
  private obsConfigExists: boolean;
  private obsConnection: OBSWebSocket;
  private obsConnectionState: UpdateStateFunc;

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

    this.obsConnection = new OBSWebSocket();

    this._persistence.dataUpdated$().subscribe(
      value => {
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

          this.connectIfNot();
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

  async tryConnecting() {
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

  async connectIfNot () {
    const isConnected = this.isObsConnected();

    if (!isConnected) {
     await this.createConnectionPromise();

      this.obsConnectionState({
        label: 'Connected'
      });
    }
  }

  private isObsConnected () {
    return this.obsConnection["_connected"];
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
