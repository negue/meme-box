import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import {TwitchConnector} from "../twitch/twitch.connector";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {WEBSOCKET_PATHS} from "@memebox/contracts";

@Service()
export class TwitchEventsWebsocket extends AbstractWebsocketHandler {

  constructor(
    @UseOpts({name: 'WS.Twitch'}) public logger: NamedLogger,
    private twitchConnection: TwitchConnector
  ) {
    super(WEBSOCKET_PATHS.TWITCH_EVENTS);

    twitchConnection.twitchEvents$()
      .subscribe(twitchEvent => {
        this.sendDataToAllSockets(JSON.stringify(twitchEvent));
      })
  }
}

