import {createExpress, PersistenceInstance} from "./express-server";
import {createWebSocketServer, sendDataToAllSockets} from "./websocket-server";
import {EXPRESS_PORT, WS_PORT} from "./constants";
import {debounceTime} from "rxjs/operators";
import * as open from 'open';

import * as fs from 'fs';


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

// TODO add delay during development build
// because angular needs some seconds more to start
if(fs.existsSync('package.json')) {
  open(`http://localhost:4200`);
} else {
  open(`http://localhost:${EXPRESS_PORT}`);
}

