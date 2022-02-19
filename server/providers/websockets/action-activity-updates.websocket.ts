import {Service} from "@tsed/di";
import * as WebSocket from "ws";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {ActionActiveStateEventBus} from "../actions/action-active-state-event.bus";
import {WEBSOCKET_PATHS} from "@memebox/contracts";

@Service()
export class ActionActivityUpdatesWebsocket extends AbstractWebsocketHandler {


  constructor(
    // @UseOpts({name: 'WS.Twitch'}) public logger: NamedLogger,
    private activityEventBus: ActionActiveStateEventBus
  ) {
    super(WEBSOCKET_PATHS.ACTION_ACTIVITY);

    activityEventBus.AllEvents$.subscribe(value => {
      const activityAsJson = JSON.stringify(value);
      this.sendDataToAllSockets(activityAsJson);
    });
  }

  protected onConnectedSocket(ws: WebSocket): void {
    console.info('new ActionActivityUpdates WS Connection');
  }

  WebSocketServerLabel = '';
}

