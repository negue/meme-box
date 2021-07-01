import {Service} from "@tsed/di";
import {ActionTriggerHandler} from "./actions/action-trigger.handler";
import {TwitchBootstrap} from "./twitch/twitch.bootstrap";
import {WebsocketBootstrap} from "./websockets/websocket.bootstrap";
import {ObsConnection} from "./obs-connection";

/**
 * This file is used to bootstrap all services that "just" do some work
 * And not used from other classes
 */

@Service()
export class BootstrapServices {
  constructor(
    mediaTriggerHandler: ActionTriggerHandler,
    _twitchBootstrap: TwitchBootstrap,
    _websocketBootstrap: WebsocketBootstrap,
    private obsConnection : ObsConnection,
  ) {
    // connect at the beginning so that scripts don't have to wait on the first call
    obsConnection.getCurrentConnection();
  }
}
