import {Service} from "@tsed/di";
import {HttpServer} from "@tsed/common";
import url from "url";
import {MemeboxWebsocket} from "./memebox.websocket";
import {TwitchEventsWebsocket} from "./twitch-events.websocket";
import {ActionActivityUpdatesWebsocket} from "./action-activity-updates.websocket";
import {ConnectionsStateWebsocket} from "./connections-state.websocket";
import {ConnectionsStateHub} from "../connections-state.hub";
import {ErrorStateWebsocket} from "./error-state.websocket";

// This is just to have all Services created on startup

@Service()
export class WebsocketBootstrap {
  constructor (
    @HttpServer httpServer: HttpServer,
    memeboxWebsocket: MemeboxWebsocket,
    twitchEventWebsocket: TwitchEventsWebsocket,
    actionActivityWebsocket: ActionActivityUpdatesWebsocket,
    connectionsStateWebsocket: ConnectionsStateWebsocket,
    errorStateWebsocket: ErrorStateWebsocket,
    private connectionStateHub: ConnectionsStateHub,
  ) {
    const ALL_OTHER_WEBSOCKET_SERVERS = [
      twitchEventWebsocket,
      actionActivityWebsocket,
      connectionsStateWebsocket,
      errorStateWebsocket
    ];

    httpServer.on('upgrade', function upgrade (request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      const foundWebsocketServer = ALL_OTHER_WEBSOCKET_SERVERS.find(wss => wss.websocketPath === pathname);
      if (foundWebsocketServer) {
        foundWebsocketServer.handleUpgrade(request, socket, head);
        return;
      }

      memeboxWebsocket.handleUpgrade(request, socket, head);
    });

    const ALL_WEBSOCKET_SERVERS = [
      ...ALL_OTHER_WEBSOCKET_SERVERS,
      memeboxWebsocket
    ];

    for (const wss of ALL_WEBSOCKET_SERVERS) {
      if (wss.WebSocketServerLabel) {
        const stateOfWS = this.connectionStateHub.registerService({
          name: wss.WebSocketServerLabel
        });

        wss.ConnectionCount$.subscribe(val => {
          stateOfWS({
            label: val + ' connected'
          })
        });
      }
    }
  }
}
