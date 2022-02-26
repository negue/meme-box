import {Service} from "@tsed/di";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {ScreenActiveStateEventBus} from "../screens/screen-active-state-event.bus";
import {AbstractSimpleObservableWebSocketService} from "./abstract-simple-observable-web-socket-service";

@Service()
export class ScreenActivityWebsocket
  extends AbstractSimpleObservableWebSocketService {
  constructor(
    private activityEventBus: ScreenActiveStateEventBus
  ) {
    super(WEBSOCKET_PATHS.SCREEN_ACTIVITY, activityEventBus.AllEvents$);
  }

  WebSocketServerLabel = '';
}

