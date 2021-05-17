import open from 'open';
import {LOGGER} from "./logger.utils";
import {bootstrapTsED} from "./server.bootstrap";
import { isProduction } from "./server.tsed";

// CLI, Headless Mode

bootstrapTsED().then(async ({expressServer}) => {
  const port: number = expressServer.get('port');

  if (!isProduction) {
    const waitForLocalhost = require('wait-for-localhost');

    console.info('Waiting on Angular to finish the build :)');

    await waitForLocalhost({port: 4200});

    open(`http://localhost:4200?port=${port}`);
    LOGGER.info('== DEV-MODE == Server is ready');
  } else {
    LOGGER.info('Server is ready');
    open(`http://localhost:${port}`);
  }
});

