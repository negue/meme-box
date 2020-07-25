import {createExpress, PersistenceInstance} from "./express-server";
import {createWebSocketServer, sendDataToAllSockets} from "./websocket-server";
import {EXPRESS_PORT, WS_PORT} from "./constants";
import {debounceTime} from "rxjs/operators";
import opn from 'opn';


const expressServer = createExpress(EXPRESS_PORT);
const ws = createWebSocketServer(WS_PORT);


// todo export to server.ts and then refactor it
PersistenceInstance.dataUpdated$()
  .pipe(
    debounceTime(600)
  )
  .subscribe(() => {
    sendDataToAllSockets('UPDATE_DATA');
  });

opn(`http://localhost:${EXPRESS_PORT}`);
