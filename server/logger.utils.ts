import {NamedLogger} from "./providers/named-logger";
import {$log} from "@tsed/common";


// TODO move from winston to @tsed/logger for DI injection magic

export function newLogger(label: string) {
  const newLogger = new NamedLogger({
    name: label
  }, $log);

  return newLogger;
}

export const LOGGER = newLogger('MemeBox');

LOGGER.info('##########  Started  ##########');

function logAndExit (type: string) {
  process.on(type as any, (err: Error) => {
    if (typeof err === 'string') {
      LOGGER.error({type, err});
    } else {
      const message = err.message;
      const stack = err.stack;
      LOGGER.error({type, ...err, message, stack});
    }

    // Exiting the process on error, doesnt work,
    // because the Logging-Stream cant work then to write the error...

    return true;
  });
}

// log and exit for uncaughtException events.
logAndExit('uncaughtException');
// log and exit for unhandledRejection events.
logAndExit('unhandledRejection');
