import {createExpress} from "./express-server";
import {sendDataToAllSockets} from "./websocket-server";
import {DEFAULT_PORT, REMOTE_VERSION_FILE} from "./constants";
import {debounceTime, startWith, take} from "rxjs/operators";
import {PersistenceInstance} from "./persistence";
import {ACTIONS} from "@memebox/contracts";
import {LOGGER} from "./logger.utils";
import {TimedHandler} from "./timed.handler";

import https from 'https';
import currentVersionJson from '@memebox/version';
import {STATE_OBJECT} from "./rest-endpoints/state";
import {Lazy} from "@gewd/markdown/utils";

// This file creates the "shared" server logic between headless / electron

// TODO use config values?

const portArgument = process.argv.find(arg => arg.includes('--port'));

const CONFIG_IS_LOADED$ = PersistenceInstance.configLoaded$.pipe(
  take(1)
).toPromise();

export const ExpressServerLazy = Lazy.create(() => CONFIG_IS_LOADED$.then(value => {
  const SAVED_PORT = PersistenceInstance.getConfig()?.customPort;

  const PORT_ARGUMENT_OPTION = portArgument
    ? +portArgument.replace('--port=', '')
    : null;

  if (PORT_ARGUMENT_OPTION) {
    LOGGER.info(`Using the --port Argument: ${PORT_ARGUMENT_OPTION}`);
  } else if (!SAVED_PORT) {
    LOGGER.info(`Using the default Port: ${DEFAULT_PORT}`);
  }

  const NEW_PORT = PORT_ARGUMENT_OPTION ?? SAVED_PORT ?? DEFAULT_PORT;

  const expressServer = createExpress(NEW_PORT);
 // const {server, wss} = createWebSocketServer(NEW_PORT);

  // Also mount the app here
 // server.on('request', expressServer);

  return {
    expressServer
  };
}));


let currentTimers = '';

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
    // TODO move to a different place?
    sendDataToAllSockets(ACTIONS.UPDATE_DATA);

    const jsonOfTimers = JSON.stringify(PersistenceInstance.listTimedEvents());

    if (currentTimers != jsonOfTimers) {
      timedHandler.refreshTimers();
      currentTimers = jsonOfTimers;

      LOGGER.info(`Refreshing TimedHandler`);
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
