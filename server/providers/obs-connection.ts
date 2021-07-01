import {Service, UseOpts} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {Persistence} from "../persistence";
import OBSWebSocket from "obs-websocket-js";
import {NamedLogger} from "./named-logger";

@Service()
export class ObsConnection {
  private obsConnection: OBSWebSocket;
  private obsConnectionPromise: Promise<void>;

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    @UseOpts({name: 'ObsConnection'}) public logger: NamedLogger,
  ) {
    const obsConfig = _persistence.getConfig(false).obs;

    const obsConfigExists = !!obsConfig?.hostname;

    this.obsConnection = new OBSWebSocket();
    this.obsConnectionPromise = obsConfigExists
      ? this.obsConnection.connect({
        address: obsConfig?.hostname,
        password: obsConfig?.password
      }, error => this.logger.error(error))
      : Promise.resolve();
  }

  async getCurrentConnection() : Promise<OBSWebSocket> {
    try {
      await this.obsConnectionPromise;
    } catch (e) {
      this.logger.error('Error while connecting to OBS', e);
    }

    return this.obsConnection
  }

  async newConnection(hostname: string, password?: string) : Promise<OBSWebSocket> {
    const obsConnection = new OBSWebSocket();
    await this.obsConnection.connect({
      address: hostname,
      password: password
    });

    return obsConnection;
  }
}
