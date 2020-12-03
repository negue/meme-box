import express, {Express} from 'express';
import {
  API_PREFIX,
  CLIP_ENDPOINT,
  CLIP_ID_ENDPOINT,
  CONFIG_ENDPOINT,
  CONFIG_MEDIA_ENDPOINT,
  CONFIG_OPEN_ENDPOINT,
  CONFIG_TWITCH_CHANNEL_ENDPOINT,
  CONFIG_TWITCH_LOG_ENDPOINT,
  CONFIG_TWITCH_BOT_ENDPOINT,
  DANGER_ENDPOINT,
  FILE_ENDPOINT,
  FILES_ENDPOINT,
  FILES_OPEN_ENDPOINT,
  LOG_ENDPOINT,
  NETWORK_IP_LIST_ENDPOINT,
  SCREEN_CLIPS_ID_ENDPOINT,
  SCREEN_ENDPOINT,
  SCREEN_ID_ENDPOINT,
  TAGS_ENDPOINT,
  TIMED_ENDPOINT,
  TWITCH_ENDPOINT, CONFIG_TWITCH_BOT_INTEGRATION_ENDPOINT
} from './constants';
import * as fs from 'fs';
import {existsSync} from 'fs';
import {listNetworkInterfaces} from "./network-interfaces";
import {PersistenceInstance} from "./persistence";

import open from 'open';
import {TAG_ROUTES} from "./rest-endpoints/tags";
import {getFiles, mapFileInformations} from "./file.utilts";
import {allowedFileUrl, clipValidations, screenValidations, validOrLeave} from "./validations";

import {DANGER_ROUTES} from "./rest-endpoints/danger";
import {NEW_CONFIG_PATH} from "./path.utils";
import {LOG_ROUTES} from "./rest-endpoints/logs";
import {TWITCH_ROUTES} from "./rest-endpoints/twitch";
import {TIMER_ROUTES} from "./rest-endpoints/timers";
import {TwitchConfig} from "../projects/contracts/src/lib/types";

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




/**
 * Config API
 */

app.get(CONFIG_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.getConfig());
});

// Put = Update
app.put(CONFIG_ENDPOINT, (req, res) => {
  // update config
  res.send(PersistenceInstance.updateConfig(req.body));
});

// Put = Update Media Folder Path
app.put(CONFIG_MEDIA_ENDPOINT, (req, res) => {
  const mediaFolder: string = req.body.mediaFolder;

  if (!allowedFileUrl(mediaFolder)) {
    res.send({ok: false})
    return;
  }

  if (!existsSync(mediaFolder)) {
    res.send({ok: false})
    return;
  }

  // update config
  res.send(PersistenceInstance.updateMediaFolder(req.body.mediaFolder));
});

// Put = Update Media Folder Path
app.put(CONFIG_TWITCH_CHANNEL_ENDPOINT, (req, res) => {
  const twitchConfigBody: TwitchConfig = req.body;

  // update config
  res.send(PersistenceInstance.updateTwitchChannel(twitchConfigBody.channel));
});

// TODO Refactor this config boilerplate !!!

app.put(CONFIG_TWITCH_LOG_ENDPOINT, (req, res) => {
  const twitchConfigBody: TwitchConfig = req.body;

  // update config
  res.send(PersistenceInstance.updateTwitchLog(twitchConfigBody.enableLog));
});

app.put(CONFIG_TWITCH_BOT_INTEGRATION_ENDPOINT, (req, res) => {
  // update config
  const {bot} = req.body.twitch;
  res.send(PersistenceInstance.updateTwitchBotIntegration(bot));
});

app.put(CONFIG_TWITCH_BOT_ENDPOINT, (req, res) => {
  // update config
  res.send(PersistenceInstance.updateTwitchBot(req.body.twitch));
});

app.get(CONFIG_OPEN_ENDPOINT, async (req, res) => {
  await open(NEW_CONFIG_PATH);

  res.send({open: true});
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

  // files with information
  const fileInfoList = mapFileInformations(mediaFolder, files);

  res.send(fileInfoList);
});

// TODO use IDs instead of names ?
// TODO use express.static ?
// after the json "database" is done
// use filename which is under
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
});

// Put = Update
app.get(NETWORK_IP_LIST_ENDPOINT, (req, res) => {
  // update config
  res.send(listNetworkInterfaces());
});



export function createExpress(port) {
  app.set('port', port);

  // app.get('port')


  return app;
}
