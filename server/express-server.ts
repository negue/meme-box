import express, {Express} from 'express';
import {
  API_PREFIX,
  CLIP_ENDPOINT,
  CLIP_ID_ENDPOINT,
  CONFIG_ENDPOINT,
  CONFIG_MEDIA_ENDPOINT,
  CONFIG_TWITCH_CHANNEL_ENDPOINT,
  FILE_ENDPOINT,
  FILES_ENDPOINT,
  FILES_OPEN_ENDPOINT,
  NETWORK_IP_LIST_ENDPOINT,
  SCREEN_CLIPS_ENDPOINT,
  SCREEN_CLIPS_ID_ENDPOINT,
  SCREEN_ENDPOINT,
  SCREEN_ID_ENDPOINT,
  TAGS_ENDPOINT,
  TWITCH_ENDPOINT,
  TWITCH_ID_ENDPOINT,
  TWITCH_TRIGGER_ENDPOINT
} from "./constants";
import * as fs from 'fs';
import {listNetworkInterfaces} from "./network-interfaces";
import {PersistenceInstance} from "./persistence";
import {TwitchTriggerCommand} from "../projects/contracts/src/lib/types";

import open from 'open';
import {Subject} from "rxjs";
import {TAG_ROUTES} from "./rest-endpoints/tags";
import {getFiles, mapFileInformations} from "./file.utilts";

const {  normalize, join } = require('path');


var cors = require('cors')
var bodyParser = require('body-parser');

const versions = process.versions;

var isInElectron = !!versions['electron'];

var app: Express = express();

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

export const ExampleTwitchCommandsSubject = new Subject<TwitchTriggerCommand>();

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
app.post(CLIP_ENDPOINT, (req, res) => {
  // save the clip
  // return ID
  res.send(PersistenceInstance.addClip(req.body));
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

/**
 * OBS-Specific API
 */


app.get(SCREEN_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.listScreens());
});


// Post = New
app.post(SCREEN_ENDPOINT, (req, res) => {
  res.send(PersistenceInstance.addScreen(req.body));
});

// Put = Update
app.put(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(PersistenceInstance.updateScreen(req.params['screenId'], req.body));
});
// Delete
app.delete(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(PersistenceInstance.deleteScreen(req.params['screenId']));
});


// Post = New
app.post(SCREEN_CLIPS_ENDPOINT, (req, res) => {
  const {screenId} = req.params;

  res.send(PersistenceInstance.addScreenClip(screenId, req.body));
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
 * Twitch API
 */

app.get(TWITCH_ENDPOINT, (req,res) => {
  res.send(PersistenceInstance.listTwitchEvents());
});


// Post = New
app.post(TWITCH_ENDPOINT, (req, res) => {
  res.send(PersistenceInstance.addTwitchEvent(req.body));
});

// Put = Update
app.put(TWITCH_ID_ENDPOINT, (req, res) => {
  res.send(PersistenceInstance.updateTwitchEvent(req.params['eventId'], req.body));
});
// Delete
app.delete(TWITCH_ID_ENDPOINT, (req, res) => {
  res.send(PersistenceInstance.deleteTwitchEvent(req.params['eventId']));
});

// Trigger Twitch Command
app.post(TWITCH_TRIGGER_ENDPOINT, (req, res) => {
  ExampleTwitchCommandsSubject.next(req.body);

  res.send({ok: true});
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
  // update config
  res.send(PersistenceInstance.updateMediaFolder(req.body.mediaFolder));
});

// Put = Update Media Folder Path
app.put(CONFIG_TWITCH_CHANNEL_ENDPOINT, (req, res) => {
  // update config
  res.send(PersistenceInstance.updateTwitchChannel(req.body.twitchChannel));
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
  const fileInfoList = mapFileInformations(mediaFolder, app.get('port'), files);

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

  // simple solution
  // check one path and then other
  const mediaFolder = PersistenceInstance.getConfig().mediaFolder;

  const pathsArray = [
    normalize(`${mediaFolder}/${firstParam}`),
    `./assets/${firstParam}`
  ];

  for (const path of pathsArray) {
    if (fs.existsSync(path)) {
      res.sendFile(path);
      return;
    }
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
