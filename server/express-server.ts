// @ts-ignore
import express, {Express} from 'express';
import {
  API_PREFIX,
  CLIP_ENDPOINT,
  CLIP_ID_ENDPOINT,
  CONFIG_ENDPOINT,
  DANGER_ENDPOINT,
  FILE_BY_ID_ENDPOINT,
  FILE_ENDPOINT,
  FILES_ENDPOINT,
  FILES_OPEN_ENDPOINT,
  LOG_ENDPOINT,
  NETWORK_IP_LIST_ENDPOINT,
  SCREEN_CLIPS_ID_ENDPOINT,
  SCREEN_ENDPOINT,
  SCREEN_ID_ENDPOINT,
  STATE_ENDPOINT,
  TAGS_ENDPOINT,
  TIMED_ENDPOINT,
  TWITCH_ENDPOINT
} from './constants';
import * as fs from 'fs';
import {listNetworkInterfaces} from "./network-interfaces";
import {PersistenceInstance} from "./persistence";

// @ts-ignore
import open from 'open';
import {TAG_ROUTES} from "./rest-endpoints/tags";
import {getFiles, mapFileInformations} from "./file.utilts";
import {allowedFileUrl, clipValidations, screenValidations, validOrLeave} from "./validations";

import {DANGER_ROUTES} from "./rest-endpoints/danger";
import {LOG_ROUTES} from "./rest-endpoints/logs";
import {TWITCH_ROUTES} from "./rest-endpoints/twitch";
import {TIMER_ROUTES} from "./rest-endpoints/timers";
import {CONFIG_ROUTES} from "./rest-endpoints/config";
import {STATE_ROUTES} from "./rest-endpoints/state";
import {SERVER_URL} from "@memebox/contracts";

const {  normalize, join } = require('path');


const cors = require('cors');
const bodyParser = require('body-parser');

const versions = process.versions;

const isInElectron = !!versions['electron'];

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

const rootPath = isInElectron ? join(__dirname, '/../../dist') : 'dist';

app.use(express.static(rootPath));

app.get(`${API_PREFIX}/debugPaths`, (req, res) => {
  res.send({
    ELECTRON: isInElectron,
    DIR: __dirname,
    rootPath
  });
})


app.get(API_PREFIX, (req,res) => {
  res.send(PersistenceInstance.fullState());
});

// TODO Add CONTSTANTS Values
// TODO better to register apis?
/**
 * Clips API
 */

app.get(CLIP_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.listClips());
});

// Post = New
app.post(CLIP_ENDPOINT, clipValidations, validOrLeave, (req, res) => {
  const newClip = req.body;

  // save the clip
  // return ID
  res.send({
    ok: true,
    id: PersistenceInstance.addClip(newClip)
  });
});

// Put = Update
app.put(CLIP_ID_ENDPOINT, (req, res) => {
  // update clip
  res.send(PersistenceInstance.updateClip(req.params['clipId'], req.body));
});
// Delete
app.delete(CLIP_ID_ENDPOINT, (req, res) => {
  // delete clip
  // return ID
  res.send(PersistenceInstance.deleteClip(req.params['clipId']));
});

app.use(TAGS_ENDPOINT, TAG_ROUTES);
app.use(DANGER_ENDPOINT, DANGER_ROUTES);
app.use(LOG_ENDPOINT, LOG_ROUTES);
app.use(TWITCH_ENDPOINT, TWITCH_ROUTES);
app.use(TIMED_ENDPOINT, TIMER_ROUTES);
app.use(CONFIG_ENDPOINT, CONFIG_ROUTES);
app.use(STATE_ENDPOINT, STATE_ROUTES);

/**
 * OBS-Specific API
 */


app.get(SCREEN_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.listScreens());
});


// Post = New
app.post(SCREEN_ENDPOINT, screenValidations, validOrLeave, (req, res) => {
  const newScreenId = PersistenceInstance.addScreen(req.body);

  res.send({
    ok: true,
    id: newScreenId
  });
});

// Put = Update
app.put(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(PersistenceInstance.updateScreen(req.params['screenId'], req.body));
});
// Delete
app.delete(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(PersistenceInstance.deleteScreen(req.params['screenId']));
});

// Put = Update
app.put(SCREEN_CLIPS_ID_ENDPOINT, (req, res) => {
  const {screenId, clipId} = req.params;

  res.send(PersistenceInstance.updateScreenClip(screenId, clipId, req.body));
});
// Delete
app.delete(SCREEN_CLIPS_ID_ENDPOINT, (req, res) => {
  const {screenId, clipId} = req.params;

  res.send(PersistenceInstance.deleteScreenClip(screenId, clipId));
});

app.get(FILES_OPEN_ENDPOINT, async (req, res) => {

  const mediaFolder = PersistenceInstance.getConfig().mediaFolder;

  await open(mediaFolder);

  res.send({open: true});
});

app.get(FILES_ENDPOINT, async (req, res) => {

  const mediaFolder = PersistenceInstance.getConfig().mediaFolder;

  // fullpath as array
  const files = await getFiles(mediaFolder);

  try {
    // files with information
    const fileInfoList = mapFileInformations(mediaFolder, files);

    res.send(fileInfoList);
  }
  catch(error)
  {
    res.status(500)
      .send({error: error.message});
  }
});

app.get(FILE_BY_ID_ENDPOINT, function(req, res){
  const mediaId = req.params['mediaId'];

  console.info(req.params);

  if (!mediaId){
    res.send('need a param');
    return;
  }

  // simple solution
  // check one path and then other
  const mediaFolder = PersistenceInstance.getConfig().mediaFolder;
  const clipMap = PersistenceInstance.fullState().clips;

  const clip = clipMap[mediaId];

  if (!clip) {
    res.send('invalid mediaId');
    return;
  }

  const filename = clip.path.replace(`${SERVER_URL}/file`, mediaFolder);

  if (fs.existsSync(filename)) {
    res.sendFile(filename);
    return;
  }

  console.error(`file not found: ${mediaId}`);

  res.status(404);
  res.send({
    ok: false
  });
});


// TODO - Remove on the next version
// dev mode : "/src/assets"
// prod mode:  "/assets"
app.get(FILE_ENDPOINT, function(req, res){
  const firstParam = req.params[0];

  if (!firstParam){
    res.send('need a param');
    return;
  }

  // possible "hack" to access some files
  // TODO check for hijacks and stuff
  if (!allowedFileUrl(firstParam)) {
    res.send('nope');
    return;
  }

  // simple solution
  // check one path and then other
  const mediaFolder = PersistenceInstance.getConfig().mediaFolder;

  const filename = normalize(`${mediaFolder}/${firstParam}`);

  if (fs.existsSync(filename)) {
    res.sendFile(filename);
    return;
  }

  console.error(`file not found: ${firstParam}`);

  res.status(404);
  res.send({
    ok: false
  });
});


// List Network IP Entries
app.get(NETWORK_IP_LIST_ENDPOINT, (req, res) => {
  res.send(listNetworkInterfaces());
});



export function createExpress(port) {
  app.set('port', port);

  // app.get('port')


  return app;
}
