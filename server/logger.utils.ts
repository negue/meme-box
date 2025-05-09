import {NamedLogger} from "./providers/named-logger";
import { CLI_OPTIONS } from './utils/cli-options';


// TODO move from winston to @tsed/logger for DI injection magic

export function newLogger(label: string) {
  const newLogger = new NamedLogger({
    name: label
  });

  return newLogger;
}

export const LOGGER = newLogger('MemeBox');

LOGGER.info('##########  Started Log  ##########');

// Each named logger increases this...
// this needs to be redone, maybe use logtape or something
// upgrading the max to remove the warning
process.setMaxListeners(30);
/*
const oldProcessListener = process.on;
process.on = function (event: string, listener: (...args: any[]) => void) {
   console.trace('Added Process Listener for', {event});


  return oldProcessListener.call(this, event, listener);
};*/

function logAndExit (type: string) {
  process.on(type as any, (err: Error) => {
    if (typeof err === 'string') {
      LOGGER.error(err, 'Process Event Type: '+type);
    } else {
      const message = err.message;
      const stack = err.stack;
      LOGGER.error({...err, message, stack}, 'Process Event Type: '+type);
    }

    // Exiting the process on error, doesnt work,
    // because the Logging-Stream cant work then to write the error...

    return true;
  });
}

// if any other issues occur, this should mark the CI step as failed, I hope..
if (!CLI_OPTIONS.CI_TEST_MODE) {
  // log and exit for uncaughtException events.
  logAndExit('uncaughtException');
  // log and exit for unhandledRejection events.
  logAndExit('unhandledRejection');
}
