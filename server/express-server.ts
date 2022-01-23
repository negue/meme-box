import express, {Express} from 'express';
import {
  API_PREFIX,
  CLIP_ENDPOINT,
  CLIP_ID_ENDPOINT,
  DANGER_ENDPOINT,
  LOG_ENDPOINT,
  NETWORK_IP_LIST_ENDPOINT,
  STATE_ENDPOINT,
  TAGS_ENDPOINT,
  TIMED_ENDPOINT
} from './constants';
import {listNetworkInterfaces} from "./network-interfaces";
import {PersistenceInstance} from "./persistence";

import {TAG_ROUTES} from "./rest-endpoints/tags";
import {getAppRootPath, isInElectron} from "./file.utilts";
import {clipValidations, validOrLeave} from "./validations";

import {DANGER_ROUTES} from "./rest-endpoints/danger";
import {LOG_ROUTES} from "./rest-endpoints/logs";
import {TIMER_ROUTES} from "./rest-endpoints/timers";
import {STATE_ROUTES} from "./rest-endpoints/state";

const cors = require('cors');
const bodyParser = require('body-parser');


const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

const rootPath = getAppRootPath();

app.use(express.static(rootPath));

app.get(`${API_PREFIX}/debugPaths`, (req, res) => {
  res.send({
    ELECTRON: isInElectron,
    DIR: __dirname,
    rootPath
  });
})

// todo split up endpoints

app.get(API_PREFIX, (req,res) => {
  res.send(PersistenceInstance.fullState());
});

// TODO Add CONTSTANTS Values
// TODO better to register apis?
// TODO EXTRACT Controllers as  TsED Controllers
/**
 * Clips API
 */

app.get(CLIP_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.listActions());
});

// Post = New
app.post(CLIP_ENDPOINT, clipValidations, validOrLeave, (req, res) => {
  const newClip = req.body;

  // save the clip
  // return ID
  res.send({
    ok: true,
    id: PersistenceInstance.addAction(newClip)
  });
});

// Put = Update
app.put(CLIP_ID_ENDPOINT, (req, res) => {
  // update clip
  res.send(PersistenceInstance.updateAction(req.params['clipId'], req.body));
});
// Delete
app.delete(CLIP_ID_ENDPOINT, (req, res) => {
  // delete clip
  // return ID
  res.send(PersistenceInstance.deleteAction(req.params['clipId']));
});

app.use(TAGS_ENDPOINT, TAG_ROUTES);
app.use(DANGER_ENDPOINT, DANGER_ROUTES);
app.use(LOG_ENDPOINT, LOG_ROUTES);
app.use(TIMED_ENDPOINT, TIMER_ROUTES);
app.use(STATE_ENDPOINT, STATE_ROUTES);


// List Network IP Entries
app.get(NETWORK_IP_LIST_ENDPOINT, (req, res) => {
  res.send(listNetworkInterfaces());
});



export function createExpress(port: number) {
  app.set('port', port);

  // app.get('port')


  return app;
}
