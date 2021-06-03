import {Service} from "@tsed/di";
import {MediaTriggerHandler} from "./media/media-trigger.handler";
import {TwitchBootstrap} from "./twitch/twitch.bootstrap";
import {WebsocketBootstrap} from "./websockets/websocket.bootstrap";
import { KeytarService } from "./keytar.service";

/**
 * This file is used to bootstrap all services that "just" do some work
 * And not used from other classes
 */

@Service()
export class BootstrapServices {
  constructor(
    mediaTriggerHandler: MediaTriggerHandler,
    _twitchBootstrap: TwitchBootstrap,
    _websocketBootstrap: WebsocketBootstrap,
    _keytarService: KeytarService
  ) {
    _keytarService.test();
  }
}
