import {Service} from "@tsed/di";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {ConnectionsStateHub} from "../connections-state.hub";
import {AbstractSimpleObservableWebSocketService} from "./abstract-simple-observable-web-socket-service";
import {ErrorHub} from "../error-hub";
import {shareReplay, startWith} from "rxjs/operators";
import {takeLatestItems} from "@memebox/utils";

@Service()
export class ErrorStateWebsocket
  extends AbstractSimpleObservableWebSocketService {

  constructor(
    connectionsStateHub: ConnectionsStateHub,
    errorHub: ErrorHub
  ) {
    super(WEBSOCKET_PATHS.ERRORS, errorHub.NewestError$.pipe(
        takeLatestItems(20),
        startWith([]),
        shareReplay(1),
      )
    );
  }

  WebSocketServerLabel = '';
}
