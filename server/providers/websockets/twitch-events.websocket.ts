import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {TwitchQueueEventBus} from "../twitch/twitch-queue-event.bus";

@Service()
export class TwitchEventsWebsocket extends AbstractWebsocketHandler {

  constructor(
    @UseOpts({name: 'WS.Twitch'}) public logger: NamedLogger,
    private _twitchEventBus: TwitchQueueEventBus,
  ) {
    super(WEBSOCKET_PATHS.TWITCH_EVENTS);

    _twitchEventBus.AllQueuedEvents$
      .subscribe(twitchEvent => {
        this.sendDataToAllSockets(JSON.stringify(twitchEvent));
      })
  }

  WebSocketServerLabel = 'WS: Twitch-Events';
}

