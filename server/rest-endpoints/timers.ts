import {PersistenceInstance} from "../persistence";

import * as express from 'express';

/**
 * Twitch Trigger Config API
 */
export const TIMER_ROUTES = express.Router();

TIMER_ROUTES
  .get('/', (req, res) => {
    res.send(PersistenceInstance.listTimedEvents());
  })


// Post = New
.post('/', (req, res) => {
  res.send(PersistenceInstance.addTimedEvent(req.body));
})

// Put = Update
.put(':eventId', (req, res) => {
  res.send(PersistenceInstance.updateTimedEvent(req.params['eventId'], req.body));
})
// Delete
.delete(':eventId', (req, res) => {
  res.send(PersistenceInstance.deleteTimedEvent(req.params['eventId']));
});

