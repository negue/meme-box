import * as express from 'express';

export interface ServerState {
  updateAvailable: boolean
}

export const STATE_OBJECT: ServerState = {
  updateAvailable: false
}

export const STATE_ROUTES = express.Router();

STATE_ROUTES
  .get('/update_available', (req,res) => {
    res.send({update: STATE_OBJECT.updateAvailable});
  })

;
