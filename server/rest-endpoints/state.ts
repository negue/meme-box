import * as express from 'express';
import {ServerState} from "../../projects/contracts/src/lib/types";

export const STATE_OBJECT: ServerState = {
  update: {
    available: false,
    version: null
  }
}

export const STATE_ROUTES = express.Router();

STATE_ROUTES
  .get('/update_available', (req,res) => {
    res.send(STATE_OBJECT.update);
  })

;
