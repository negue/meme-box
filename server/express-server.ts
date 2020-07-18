import * as express from 'express';
import {Persistence} from "./persistence";
import {
  API_PREFIX,
  CLIP_ENDPOINT,
  CLIP_ID_ENDPOINT,
  CONFIG_ENDPOINT,
  FILE_ENDPOINT,
  SCREEN_CLIPS_ENDPOINT,
  SCREEN_CLIPS_ID_ENDPOINT,
  SCREEN_ENDPOINT,
  SCREEN_ID_ENDPOINT,
  TWITCH_ENDPOINT,
  TWITCH_ID_ENDPOINT
} from "./constants";
import * as fs from 'fs';

var cors = require('cors')
var bodyParser = require('body-parser');

var persistence = new Persistence('./settings/settings.json');
var app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('dist'))


app.get(API_PREFIX, (req,res) => {
  res.send(persistence.fullState());
});

// TODO Add CONTSTANTS Values
// TODO better to register apis?
/**
 * Clips API
 */

app.get(CLIP_ENDPOINT, (req,res) => {
  res.send(persistence.listClips());
});

// Post = New
app.post(CLIP_ENDPOINT, (req, res) => {
  // save the clip
  // return ID
  res.send(persistence.addClip(req.body));
});

// Put = Update
app.put(CLIP_ID_ENDPOINT, (req, res) => {
  // update clip
  res.send(persistence.updateClip(req.params['clipId'], req.body));
});
// Delete
app.delete(CLIP_ID_ENDPOINT, (req, res) => {
  // delete clip
  // return ID
  res.send(persistence.deleteClip(req.params['clipId']));
});


/**
 * OBS-Specific API
 */


app.get(SCREEN_ENDPOINT, (req,res) => {
  res.send(persistence.listObsUrls());
});


// Post = New
app.post(SCREEN_ENDPOINT, (req, res) => {
  res.send(persistence.addObsUrl(req.body));
});

// Put = Update
app.put(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(persistence.updateObsUrl(req.params['screenId'], req.body));
});
// Delete
app.delete(SCREEN_ID_ENDPOINT, (req, res) => {

  res.send(persistence.deleteObsUrl(req.params['screenId']));
});


// Post = New
app.post(SCREEN_CLIPS_ENDPOINT, (req, res) => {
  const {screenId} = req.params;

  res.send(persistence.addObsClip(screenId, req.body));
});

// Put = Update
app.put(SCREEN_CLIPS_ID_ENDPOINT, (req, res) => {
  const {screenId, clipId} = req.params;

  res.send(persistence.updateObsClip(screenId, clipId, req.body));
});
// Delete
app.delete(SCREEN_CLIPS_ID_ENDPOINT, (req, res) => {
  const {screenId, clipId} = req.params;

  res.send(persistence.deleteObsClip(screenId, clipId));
});


/**
 * Twitch API
 */

app.get(TWITCH_ENDPOINT, (req,res) => {
  res.send(persistence.listTwitchEvents());
});


// Post = New
app.post(TWITCH_ENDPOINT, (req, res) => {
  res.send(persistence.addTwitchEvent(req.body));
});

// Put = Update
app.put(TWITCH_ID_ENDPOINT, (req, res) => {
  res.send(persistence.updateTwitchEvent(req.params['eventId'], req.body));
});
// Delete
app.delete(TWITCH_ID_ENDPOINT, (req, res) => {
  res.send(persistence.deleteTwitchEvent(req.params['eventId']));
});


/**
 * Config API
 */

app.get(CONFIG_ENDPOINT, (req,res) => {
  res.send(persistence.getConfig());
});

// Put = Update
app.put(CONFIG_ENDPOINT, (req, res) => {
  // update config
  res.send(persistence.updateConfig(req.body));
});

// TODO use IDs instead of names
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

  const appPath = process.cwd();

  // possible "hack" to access some files
  // TODO check for hijacks and stuff

  // simple solution
  // check one path and then other

  const pathsArray = [
    `./src/assets/${firstParam}`,
    `./assets/${firstParam}`
  ];

  for (const path of pathsArray) {
    console.info({ path });
    if (fs.existsSync(path)) {
      console.warn('EXISTS');
      res.sendFile(path, {root: appPath});
      return;
    }
  }

  console.error('not found');
});


export function createExpress(port) {
  app.set('port', port);

  app.listen(app.get('port'));

  return app;
}

export {persistence};
