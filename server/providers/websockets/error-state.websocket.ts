import {Service} from "@tsed/di";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {ConnectionsStateHub} from "../connections-state.hub";
import {AbstractSimpleObservableWebSocketService} from "./abstract-simple-observable-web-socket-service";
import {ErrorHub} from "../error-hub";

@Service()
export class ErrorStateWebsocket
  extends AbstractSimpleObservableWebSocketService {

  constructor(
    connectionsStateHub: ConnectionsStateHub,
    errorHub: ErrorHub
  ) {
    super(WEBSOCKET_PATHS.ERRORS, errorHub.NewestError$);
  }

  WebSocketServerLabel = '';

  // skipcq: JS-0356
  protected shouldSentDefaultValue(_data: unknown): boolean {
    return false;
  }
}
