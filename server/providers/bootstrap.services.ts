import { Service } from "@tsed/di";
import { ActionTriggerHandler } from "./actions/action-trigger.handler";
import { TwitchBootstrap } from "./twitch/twitch.bootstrap";
import { WebsocketBootstrap } from "./websockets/websocket.bootstrap";
import { ScriptHandler } from "./actions/scripts/script.handler";
import { ObsConnection } from "./obs-connection";
import { ObsApi } from "./actions/scripts/apis/obs.api";
import { Persistence } from "../persistence";
import { Inject } from "@tsed/common";
import { PERSISTENCE_DI } from "./contracts";
import { Logger } from "@tsed/logger";

/**
 * This file is used to bootstrap all services that "just" do some work
 * And not used from other classes
 */

@Service()
export class BootstrapServices {
  constructor(
    _mediaTriggerHandler: ActionTriggerHandler,
    _twitchBootstrap: TwitchBootstrap,
    _websocketBootstrap: WebsocketBootstrap,
    _scriptHandler: ScriptHandler,
    private _obsConnection: ObsConnection,
    private _mainLogger: Logger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
  ) {
     this.tryCatchAsync(
       this.connectToObsAndRefreshScreens(),
       "connectToObsAndRefreshScreens"
     );
  }

  private async tryCatchAsync(promiseToWait: Promise<unknown>,
                              errorMessage: string)  {
    try {
      await promiseToWait;
    }catch (e) {
      this._mainLogger.error(`Unexpected error of: ${errorMessage}`, e);
    }
  }

  private async connectToObsAndRefreshScreens() {
    if (!this._obsConnection.obsConfigExists) {
      return;
    }

    this._obsConnection.tryConnecting();

    // waiting until the connection is successfully established
    await this._obsConnection.isConnectedAsync;

    const obsWS = await this._obsConnection.getCurrentConnection();

    const obsApi = new ObsApi(this._obsConnection, obsWS);

    const allBrowserSources = await obsApi.listBrowserSources();

    // for now it is the easiest way to do, if anyone wants to improve it
    // please open a PR :)

    const allScreens = this._persistence.listScreens();

    for (const screen of allScreens) {
      const screenId = screen.id;

      for (const browserSource of allBrowserSources) {
        const url = browserSource.sourceSettings["url"] as string;

        if (!url || !url.includes(screenId)) {
          continue;
        }

        const sourceName = browserSource.sourceName;

        await obsApi.refreshBrowserSource(sourceName);

        this._mainLogger.info(`Screen in OBS reloaded: ${sourceName}`);

        break;
      }
    }
  }
}
