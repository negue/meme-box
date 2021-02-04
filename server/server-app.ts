import {createExpress} from "./express-server";
import {createWebSocketServer, sendDataToAllSockets} from "./websocket-server";
import {DEFAULT_PORT, REMOTE_VERSION_FILE} from "./constants";
import {debounceTime, startWith, take} from "rxjs/operators";
import {TwitchHandler} from './twitch.handler';
import {PersistenceInstance} from "./persistence";
import {ACTIONS} from "../projects/contracts/src/lib/actions";
import {LOGGER} from "./logger.utils";
import {ExampleTwitchCommandsSubject} from "./shared";
import {TimedHandler} from "./timed.handler";

import https from 'https';
import currentVersionJson from '../src/version_info.json';
import {STATE_OBJECT} from "./rest-endpoints/state";

// This file creates the "shared" server logic between headless / electron

// TODO use config values?

const portArgument = process.argv.find(arg => arg.includes('--port'));

export const NEW_PORT = portArgument ? +portArgument.replace('--port=', '') : DEFAULT_PORT;

export const expressServer = createExpress(NEW_PORT);
export const {server, wss} = createWebSocketServer(NEW_PORT);

// Also mount the app here
server.on('request', expressServer);

let currentConfigJsonString = '';
let currentTimers = '';
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

const timedHandler = new TimedHandler();
timedHandler.startTimers();

PersistenceInstance.dataUpdated$()
  .pipe(
    debounceTime(600),
    startWith(true)
  )
  .subscribe(() => {
    sendDataToAllSockets(ACTIONS.UPDATE_DATA);

    const config = PersistenceInstance.getConfig();
    const jsonOfConfig = JSON.stringify(config.twitch);

    if (currentConfigJsonString !== jsonOfConfig
      && !!config.twitch?.channel
    ) {
      currentConfigJsonString = jsonOfConfig;

      LOGGER.info(`Creating the TwitchHandler for: ${config.twitch.channel}`);

      if (twitchHandler != null) {
        twitchHandler.disconnect();
      }

      twitchHandler = new TwitchHandler(config.twitch);
    }

    const jsonOfTimers = JSON.stringify(PersistenceInstance.listTimedEvents());

    if (currentTimers != jsonOfTimers) {
      timedHandler.refreshTimers();
      currentTimers = jsonOfTimers;

      LOGGER.info(`Refreshing TimedHandler`);
    }
  });

ExampleTwitchCommandsSubject.subscribe(value => {
  if (twitchHandler) {
    twitchHandler.handle(value);
  }
});

// Check Version & Log it

function cmpVersions (a, b) {
  var i, diff;
  var regExStrip0 = /(\.0+)+$/;
  var segmentsA = a.replace(regExStrip0, '').split('.');
  var segmentsB = b.replace(regExStrip0, '').split('.');
  var l = Math.min(segmentsA.length, segmentsB.length);

  for (i = 0; i < l; i++) {
    diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
    if (diff) {
      return diff;
    }
  }
  return segmentsA.length - segmentsB.length;
}


PersistenceInstance.configLoaded$.pipe(
  take(1)
).subscribe(() => {

  const versionCheckEnabled = PersistenceInstance.getConfig().enableVersionCheck;
  console.info({ versionCheckEnabled });

  if (versionCheckEnabled) {
    https.get(REMOTE_VERSION_FILE, function(res){
      var body = '';

      res.on('data', function(chunk){
        body += chunk;
      });

      res.on('end', function(){
        const {version} = JSON.parse(body);

        const local = currentVersionJson.VERSION_TAG;

        const isRemoteNewer = cmpVersions(version, local) > 0;

        LOGGER.info(`Remote Version newer? - ${isRemoteNewer}`, { remote: version, local });

        STATE_OBJECT.update.available = isRemoteNewer;
        STATE_OBJECT.update.version = version;
      });
    }).on('error', function(e){
      LOGGER.error("Error loading version json: ", e);
    });
  }
});
