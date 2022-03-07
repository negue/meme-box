// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import {DEFAULT_PORT} from "../../server/constants";

const splitSearch = location.search
  ?.replace('?', '')
  ?.split('&');

const PORT_STORAGE_KEY = 'memebox_port';

const SAVED_SESSION_PORT_STRING = sessionStorage.getItem(PORT_STORAGE_KEY);
const SAVED_SESSION_PORT = SAVED_SESSION_PORT_STRING
  ? +SAVED_SESSION_PORT_STRING
  : DEFAULT_PORT;

const NEW_PORT = splitSearch.find(q => q.startsWith('port'))
  ?.replace('port=', '') ?? SAVED_SESSION_PORT;

sessionStorage.setItem(PORT_STORAGE_KEY, NEW_PORT.toString());

console.info({NEW_PORT, splitSearch, location});

export const AppConfig = {
  production: false,
  environment: 'DEV',
  expressBase: `http://${location.hostname}:${NEW_PORT}`,
  wsBase: `ws://${location.hostname}:${NEW_PORT}`,
  port: NEW_PORT
};

console.info({AppConfig});

console.info('APP CONFIG DEV', AppConfig);
