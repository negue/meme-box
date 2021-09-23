import {Service} from "@tsed/di";
import {HttpServer} from "@tsed/common";
import url from "url";
import {MemeboxWebsocket} from "./memebox.websocket";
import {TwitchEventsWebsocket} from "./twitch-events.websocket";
import {ActionActivityUpdatesWebsocket} from "./action-activity-updates.websocket";

// This is just to have all Services created on startup

@Service()
export class WebsocketBootstrap {
  constructor(
    @HttpServer httpServer: HttpServer,
    memeboxWebsocket: MemeboxWebsocket,
    twitchEventWebsocket: TwitchEventsWebsocket,
    actionActivityWebsocket: ActionActivityUpdatesWebsocket
  ) {
    const ALL_OTHER_WEBSOCKET_SERVERS = [
      twitchEventWebsocket,
      actionActivityWebsocket
    ];

    httpServer.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      const foundWebsocketServer = ALL_OTHER_WEBSOCKET_SERVERS.find(wss => wss.websocketPath === pathname);

      if (foundWebsocketServer) {
        foundWebsocketServer.handleUpgrade(request, socket, head);
        return;
      }

      memeboxWebsocket.handleUpgrade(request, socket, head);
    });
  }
}
