import {Service} from "@tsed/di";
import {HttpServer} from "@tsed/common";
import url from "url";
import {MemeboxWebsocket} from "./memebox.websocket";
import {TwitchEventsWebsocket} from "./twitch-events.websocket";

// This is just to have all Services created on startup

@Service()
export class WebsocketBootstrap {
  constructor(
    @HttpServer httpServer: HttpServer,
    memeboxWebsocket: MemeboxWebsocket,
    twitchEventWebsocket: TwitchEventsWebsocket
  ) {
    httpServer.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/ws/twitch_events') {
        twitchEventWebsocket.handleUpgrade(request, socket, head);
        return;
      }

      memeboxWebsocket.handleUpgrade(request, socket, head);

    });
  }
}
