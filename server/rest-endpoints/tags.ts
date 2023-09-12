import * as express from 'express';
import { PersistenceInstance } from "@memebox/server-common";

export const TAG_ROUTES = express.Router();

TAG_ROUTES
  // Add a binding to handle '/tests'
  .get('/', (req, res) => {
    res.send(PersistenceInstance.listTags());
  })
  // Post = New
  .post('/', (req, res) => {
    // save the clip
    // return ID
    res.send(PersistenceInstance.addTag(req.body));
  })
  // Put = Update
  .put('/:tagId', (req, res) => {
    // update clip
    res.send(PersistenceInstance.updateTag(req.params['tagId'], req.body));
  })
  // Delete
  .delete('/:tagId', (req, res) => {
    // delete clip
    // return ID
    res.send(PersistenceInstance.deleteTag(req.params['tagId']));
  });
