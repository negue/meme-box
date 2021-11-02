import {Service} from "@tsed/di";
import {ActionTriggerHandler} from "./actions/action-trigger.handler";
import {TwitchBootstrap} from "./twitch/twitch.bootstrap";
import {WebsocketBootstrap} from "./websockets/websocket.bootstrap";
import {ScriptHandler} from "./actions/scripts/script.handler";

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
    _scriptHandler: ScriptHandler
  ) {
  }
}
