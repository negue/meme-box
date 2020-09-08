import * as express from 'express';
import {PersistenceInstance} from "../persistence";

export const DANGER_ROUTES = express.Router();

DANGER_ROUTES
  .post('/clean_config', (req,res) => {
    PersistenceInstance.cleanUpConfigs();

    res.send({ok: true});
  })
  .post('/add_all', (req, res) => {

    // res.send(PersistenceInstance.addTag(req.body));
  })
;
