import {Service} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {Persistence} from "../persistence";
import OBSWebSocket from "obs-websocket-js";

@Service()
export class ObsConnection {
  private obsConnection: OBSWebSocket;
  private obsConnectionPromise: Promise<void>;

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
    const obsConfig = _persistence.getConfig().obs;

    const obsConfigExists = !!obsConfig?.hostname;

    this.obsConnection = new OBSWebSocket();
    this.obsConnectionPromise = obsConfigExists
      ? this.obsConnection.connect({
        address: obsConfig?.hostname,
        password: obsConfig?.password
      })
      : Promise.resolve();
  }

  async getCurrentConnection() : Promise<OBSWebSocket> {
    await this.obsConnectionPromise;

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
