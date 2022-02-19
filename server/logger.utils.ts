import {NamedLogger} from "./providers/named-logger";


// TODO move from winston to @tsed/logger for DI injection magic

export function newLogger(label: string) {
  const newLogger = new NamedLogger({
    name: label
  });

  return newLogger;
}

export const LOGGER = newLogger('MemeBox');

LOGGER.info('##########  Started  ##########');

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

// log and exit for uncaughtException events.
logAndExit('uncaughtException');
// log and exit for unhandledRejection events.
logAndExit('unhandledRejection');
