import {PersistenceInstance} from "../persistence";

import * as express from 'express';
import {body} from "express-validator";
import {validOrLeave} from "../validations";

const timerPostValidator = [
  body('clipId').isString(),
  body('screenId').isString().optional(),
  body('everyXms').isNumeric(),
  body('active').isBoolean()
];


const timerPutValidator = [
  ...timerPostValidator,
  body('id').isString(),
];



/**
 * Twitch Trigger Config API
 */
export const TIMER_ROUTES = express.Router();

TIMER_ROUTES
  .get('/', (req, res) => {
    res.send(PersistenceInstance.listTimedEvents());
  })


// Post = New
.post('/', timerPostValidator, validOrLeave, (req, res) => {
  res.send(PersistenceInstance.addTimedEvent(req.body));
})

// Put = Update
.put('/:eventId', timerPutValidator, validOrLeave, (req, res) => {
  res.send(PersistenceInstance.updateTimedEvent(req.params['eventId'], req.body));
})
// Delete
.delete('/:eventId', (req, res) => {
  res.send(PersistenceInstance.deleteTimedEvent(req.params['eventId']));
});

