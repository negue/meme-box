import {PersistenceInstance} from "../persistence";

import * as express from 'express';
import {ExampleTwitchCommandsSubject} from "../shared";
import {body} from "express-validator";
import {validOrLeave} from "../validations";
import {Twitch} from "../../projects/contracts/src/lib/types";

const twitchPostValidator = [
  body('clipId').isString(),
  body('name').isString(),
  body('active').isBoolean()
];


const twitchPutValidator = [
  ...twitchPostValidator,
  body('id').isString(),
];


/**
 * Twitch Trigger Config API
 */
export const TWITCH_ROUTES = express.Router();

TWITCH_ROUTES
  .get('/', (req, res) => {
    res.send(PersistenceInstance.listTwitchEvents());
  })


// Post = New
  .post('/', twitchPostValidator, validOrLeave, (req, res) => {
    res.send(PersistenceInstance.addTwitchEvent(req.body));
  })

// Put = Update
  .put('/:eventId', twitchPutValidator, validOrLeave, (req, res) => {
    const updatedTwitchObject: Twitch = req.body;

    PersistenceInstance.updateTwitchEvent(req.params['eventId'], updatedTwitchObject)

    res.send({
      ok: true
    });
  })
// Delete
  .delete('/:eventId', (req, res) => {
    res.send(PersistenceInstance.deleteTwitchEvent(req.params['eventId']));
  })

// Trigger Twitch Command
  .post('/trigger', (req, res) => {
    ExampleTwitchCommandsSubject.next(req.body);

    res.send({ok: true});
  });

