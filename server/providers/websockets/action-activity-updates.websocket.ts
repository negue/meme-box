import {Service} from "@tsed/di";
import * as WebSocket from "ws";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {ActionActiveStateEventBus} from "../actions/action-active-state-event.bus";

@Service()
export class ActionActivityUpdatesWebsocket extends AbstractWebsocketHandler {


  constructor(
    // @UseOpts({name: 'WS.Twitch'}) public logger: NamedLogger,
    private activityEventBus: ActionActiveStateEventBus
  ) {
    super('/ws/action_activitiy');

    activityEventBus.AllEvents$.subscribe(value => {
      this.sendDataToAllSockets(value);
    });
  }

  protected onConnectedSocket(ws: WebSocket): void {
    console.info('new WS Connection');
  }
}

