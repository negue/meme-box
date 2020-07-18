import * as express from 'express';
import {Persistence} from "./persistence";
import {API_PREFIX} from "./constants";

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

app.get(`${API_PREFIX}/clips`, (req,res) => {
  res.send(persistence.listClips());
});

// Post = New
app.post(`${API_PREFIX}/clips`, (req, res) => {
  // save the clip
  // return ID
  res.send(persistence.addClip(req.body));
});

// Put = Update
app.put(`${API_PREFIX}/clips/:clipId`, (req, res) => {
  // update clip
  res.send(persistence.updateClip(req.params['clipId'], req.body));
});
// Delete
app.delete(`${API_PREFIX}/clips/:clipId`, (req, res) => {
  // delete clip
  // return ID
  res.send(persistence.deleteClip(req.params['clipId']));
});


/**
 * OBS-Specific API
 */


app.get(`${API_PREFIX}/obsdata`, (req,res) => {
  res.send(persistence.listObsUrls());
});


// Post = New
app.post(`${API_PREFIX}/obsdata`, (req, res) => {
  res.send(persistence.addObsUrl(req.body));
});

// Put = Update
app.put(`${API_PREFIX}/obsdata/:obsId`, (req, res) => {

  res.send(persistence.updateObsUrl(req.params['obsId'], req.body));
});
// Delete
app.delete(`${API_PREFIX}/obsdata/:obsId`, (req, res) => {

  res.send(persistence.deleteObsUrl(req.params['obsId']));
});


// Post = New
app.post(`${API_PREFIX}/obsdata/:obsId/clips`, (req, res) => {
  const {obsId} = req.params;

  res.send(persistence.addObsClip(obsId, req.body));
});

// Put = Update
app.put(`${API_PREFIX}/obsdata/:obsId/clips/:obsClipId`, (req, res) => {
  const {obsId, obsClipId} = req.params;

  res.send(persistence.updateObsClip(obsId, obsClipId, req.body));
});
// Delete
app.delete(`${API_PREFIX}/obsdata/:obsId/clips/:obsClipId`, (req, res) => {
  const {obsId, obsClipId} = req.params;

  res.send(persistence.deleteObsClip(obsId, obsClipId));
});


/**
 * Twitch API
 */

app.get(`${API_PREFIX}/twitch_events`, (req,res) => {
  res.send(persistence.listTwitchEvents());
});


// Post = New
app.post(`${API_PREFIX}/twitch_events`, (req, res) => {
  res.send(persistence.addTwitchEvent(req.body));
});

// Put = Update
app.put(`${API_PREFIX}/twitch_events/:eventId`, (req, res) => {
  res.send(persistence.updateTwitchEvent(req.params['eventId'], req.body));
});
// Delete
app.delete(`${API_PREFIX}/twitch_events/:eventId`, (req, res) => {
  res.send(persistence.deleteTwitchEvent(req.params['eventId']));
});


/**
 * Config API
 */

app.get(`${API_PREFIX}/config`, (req,res) => {
  res.send(persistence.getConfig());
});

// Put = Update
app.put(`${API_PREFIX}/config`, (req, res) => {
  // update config
  res.send(persistence.updateConfig(req.body));
});

// TODO use IDs instead of names
// after the json "database" is done
app.get('/file/*', function(req, res){
  const firstParam = req.params[0];

  if (!firstParam){
    res.send('need a param');
    return;
  }

  const appPath = process.cwd();

  // possible "hack" to access some files
  // TODO check for hijacks and stuff

  const path = `./src/assets/${firstParam}`;

  console.info('LOG', path);

  res.sendFile(path, {root: appPath});


});


export function createExpress(port) {
  app.set('port', port);

  app.listen(app.get('port'));

  return app;
}

export {persistence};
