import * as express from 'express';
import {Persistence} from "./persistence";

var cors = require('cors')
var bodyParser = require('body-parser');

var persistence = new Persistence('./settings/settings.json');
var app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
  res.send(persistence.fullState());
});

// TODO Add CONTSTANTS Values

/**
 * Clips API
 */

app.get('/clips', (req,res) => {
  res.send(persistence.listClips());
});

// Post = New
app.post('/clips', (req, res) => {
  console.info({req, body: req.body});

  // save the clip
  // return ID
  res.send(persistence.addClip(req.body));
});

// Put = Update
app.put('/clips/:clipId', (req, res) => {
  // update clip
  res.send(persistence.updateClip(req.params['clipId'], req.body));
});
// Delete
app.delete('/clips/:clipId', (req, res) => {
  // delete clip
  // return ID
  res.send(persistence.deleteClip(req.params['clipId']));
});


/**
 * OBS-Specific API
 */


app.get('/obsdata', (req,res) => {
  res.send(persistence.listObsUrls());
});


// Post = New
app.post('/obsdata', (req, res) => {
  console.info({req, body: req.body});


  res.send(persistence.addObsUrl(req.body));
});

// Put = Update
app.put('/obsdata/:obsId', (req, res) => {

  res.send(persistence.updateObsUrl(req.params['obsId'], req.body));
});
// Delete
app.delete('/obsdata/:obsId', (req, res) => {

  res.send(persistence.deleteObsUrl(req.params['obsId']));
});


// Post = New
app.post('/obsdata/:obsId/clips', (req, res) => {
  console.info({req, body: req.body});
  const {obsId} = req.params;

  res.send(persistence.addObsClip(obsId, req.body));
});

// Put = Update
app.put('/obsdata/:obsId/clips/:obsClipId', (req, res) => {
  const {obsId, obsClipId} = req.params;

  res.send(persistence.updateObsClip(obsId, obsClipId, req.body));
});
// Delete
app.delete('/obsdata/:obsId/clips/:obsClipId', (req, res) => {
  const {obsId, obsClipId} = req.params;

  res.send(persistence.deleteObsClip(obsId, obsClipId));
});


/**
 * Twitch API
 */

app.get('/twitch_events', (req,res) => {
  res.send(persistence.listTwitchEvents());
});


// Post = New
app.post('/twitch_events', (req, res) => {
  console.info({req, body: req.body});

  res.send(persistence.addTwitchEvent(req.body));
});

// Put = Update
app.put('/twitch_events/:eventId', (req, res) => {
  res.send(persistence.updateTwitchEvent(req.params['eventId'], req.body));
});
// Delete
app.delete('/twitch_events/:eventId', (req, res) => {
  res.send(persistence.deleteTwitchEvent(req.params['eventId']));
});


/**
 * Config API
 */

app.get('/config', (req,res) => {
  res.send(persistence.getConfig());
});

// Put = Update
app.put('/config', (req, res) => {
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


  res.sendFile(path, {root: appPath});


});


export function createExpress(port) {
  app.set('port', port);

  app.listen(app.get('port'));

  return app;
}
