import open from 'open';
import * as fs from 'fs';
import {expressServer} from './server-app';

// CLI, Headless Mode
console.log('Server is ready');

if(fs.existsSync('package.json')) {
  const waitForLocalhost = require('wait-for-localhost');

  console.info('Waiting on Angular to finish the build :)');

  (async () => {
    await waitForLocalhost({port: 4200});

    open(`http://localhost:4200`);
  })();
} else {
  open(`http://localhost:${expressServer.get('port')}`);
}

