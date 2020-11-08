import {createExpress, ExampleTwitchCommandsSubject} from "./express-server";
import {createWebSocketServer, sendDataToAllSockets} from "./websocket-server";
import {DEFAULT_PORT} from "./constants";
import {debounceTime, startWith} from "rxjs/operators";
import {TwitchHandler} from "./twitch.handler";
import {PersistenceInstance} from "./persistence";
import {ACTIONS} from "../projects/contracts/src/lib/actions";
import {LOGGER} from "./logger.utils";

// This file creates the "shared" server logic between headless / electron

// TODO use config values?

const portArgument = process.argv.find(arg => arg.includes('--port'));

export const NEW_PORT = portArgument ? +portArgument.replace('--port=', '') : DEFAULT_PORT;

export const expressServer = createExpress(NEW_PORT);
export const {server, wss} = createWebSocketServer(NEW_PORT);

// Also mount the app here
server.on('request', expressServer);

let currentConfigJsonString = '';
let twitchHandler:TwitchHandler = null;

PersistenceInstance.hardRefresh$()
  .pipe(
    debounceTime(600),
    startWith(true)
  )
  .subscribe(() => {
    console.info('Data Hard-Refresh');
    sendDataToAllSockets(ACTIONS.UPDATE_DATA);
  });

PersistenceInstance.dataUpdated$()
  .pipe(
    debounceTime(600),
    startWith(true)
  )
  .subscribe(() => {
    sendDataToAllSockets(ACTIONS.UPDATE_DATA);

    const config = PersistenceInstance.getConfig();
    const jsonOfConfig = JSON.stringify(config);

    if (currentConfigJsonString !== jsonOfConfig
      && !!config.twitchChannel
    ) {
      currentConfigJsonString = jsonOfConfig;

      LOGGER.info(`Creating the TwitchHandler for: ${config.twitchChannel}`);

      if (twitchHandler != null) {
        twitchHandler.disconnect();
      }

      twitchHandler = new TwitchHandler(config.twitchChannel, config.twitchLog ?? false);
    }
  });

ExampleTwitchCommandsSubject.subscribe(value => {
  if (twitchHandler) {
    twitchHandler.handle(value);
  }
})
