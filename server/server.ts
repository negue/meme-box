import {createExpress, ExampleTwitchCommandsSubject} from "./express-server";
import {createWebSocketServer, sendDataToAllSockets} from "./websocket-server";
import {EXPRESS_PORT, WS_PORT} from "./constants";
import {debounceTime, startWith} from "rxjs/operators";
import * as open from 'open';

import * as fs from 'fs';
import {TwitchHandler} from "./twitch.handler";
import {PersistenceInstance} from "./persistence";


const expressServer = createExpress(EXPRESS_PORT);
const ws = createWebSocketServer(WS_PORT);

let currentTwitchAccount = '';
let twitchHandler:TwitchHandler = null;

// todo export to server.ts and then refactor it
PersistenceInstance.dataUpdated$()
  .pipe(
    debounceTime(600),
    startWith(true)
  )
  .subscribe(() => {
    console.info('Data Updated');
    sendDataToAllSockets('UPDATE_DATA');

    const config = PersistenceInstance.getConfig();
    const twitchChannelInConfig = config.twitchChannel;

    console.info({config, twitchChannelInConfig});
    if (currentTwitchAccount !== twitchChannelInConfig) {
      currentTwitchAccount = twitchChannelInConfig;

      console.info(`Creating the TwitchHandler for: ${currentTwitchAccount}`);

      if (twitchHandler != null) {
        twitchHandler.disconnect();
      }

      twitchHandler = new TwitchHandler(currentTwitchAccount);
    }
  });

ExampleTwitchCommandsSubject.subscribe(value => {
  if (twitchHandler) {
    twitchHandler.handle(value);
  }
})

console.log('Server is ready');

// TODO add delay during development build
// because angular needs some seconds more to start
if(fs.existsSync('package.json')) {
  const waitForLocalhost = require('wait-for-localhost');

  console.info('Waiting on Angular to finish the build :)');

  (async () => {
    await waitForLocalhost({port: 4200});

    open(`http://localhost:4200`);
  })();
} else {
  open(`http://localhost:${EXPRESS_PORT}`);
}

