import open from 'open';
import * as fs from 'fs';
import {ExpressServerLazy} from './server-app';
import {LOGGER} from "./logger.utils";

// CLI, Headless Mode

ExpressServerLazy.getValue().then(async ({expressServer}) => {
  if (fs.existsSync('package.json')) {
    const waitForLocalhost = require('wait-for-localhost');

    console.info('Waiting on Angular to finish the build :)');

    await waitForLocalhost({port: 4200});

    open(`http://localhost:4200?port=${expressServer.get('port')}`);
    LOGGER.info('== DEV-MODE == Server is ready');
  } else {
    LOGGER.info('Server is ready');
    open(`http://localhost:${expressServer.get('port')}`);
  }
});

