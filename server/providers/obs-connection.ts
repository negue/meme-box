import {Service, UseOpts} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {Persistence} from "../persistence";
import OBSWebSocket from "obs-websocket-js";
import {NamedLogger} from "./named-logger";
import {timeoutAsync} from "./actions/scripts/apis/sleep.api";
import {ObsConfig} from "@memebox/contracts";

@Service()
export class ObsConnection {
  private obsConfig: ObsConfig;
  private obsConfigExists: boolean;
  private obsConnection: OBSWebSocket;

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    @UseOpts({name: 'ObsConnection'}) public logger: NamedLogger,
  ) {
    this.obsConfig = _persistence.getConfig(false).obs;

    this.obsConfigExists = !!this.obsConfig?.hostname;

    this.obsConnection = new OBSWebSocket();

  }

  async getCurrentConnection() : Promise<OBSWebSocket> {
    try {
      await this.connectIfNot();
    } catch (e) {
    }

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

    this.logger.error('Could not connect to OBS', lastError);
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
    if (!this.obsConnection["_connected"]) {
      await this.createConnectionPromise();
    }
  }

  private createConnectionPromise() {
    return this.obsConfigExists
      ? this.obsConnection.connect({
        address: this.obsConfig?.hostname,
        password: this.obsConfig?.password
      }, error => this.logger.error(error))
      : Promise.resolve();
  }
}
