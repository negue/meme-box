import {Service} from "@tsed/di";
import { WEBSOCKET_PATHS } from "@memebox/contracts";
import { ConnectionsStateHub } from "../connections-state.hub";
import { AbstractSimpleObservableWebSocketService } from "./abstract-simple-observable-web-socket-service";

@Service()
export class ConnectionsStateWebsocket
  extends AbstractSimpleObservableWebSocketService {

  constructor(
    connectionsStateHub: ConnectionsStateHub,
  ) {
    super(WEBSOCKET_PATHS.CONNECTIONS_STATE, connectionsStateHub.currentState$());
  }

  WebSocketServerLabel = '';
}
