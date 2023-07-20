import open from 'open';
import { CLI_OPTIONS, LOGGER } from "@memebox/server-common";
import { bootstrapTsED } from "./server.bootstrap";
import { isProduction } from "./server.tsed";

// CLI, Headless Mode

bootstrapTsED().then(async ({expressServer}) => {
  const port: number = expressServer.get('port');

  if (!isProduction) {
    const waitForLocalhost = require('wait-for-localhost');

    await waitForLocalhost({port: 4200});

    if (CLI_OPTIONS.OPEN_BROWSER) {
      open(`http://localhost:4200?port=${port}`);
    }

    LOGGER.info('== DEV-MODE == Server is ready');
  } else {
    LOGGER.info('Server is ready');

    if (CLI_OPTIONS.OPEN_BROWSER) {
      open(`http://localhost:${port}`);
    }
  }
});

