import * as express from 'express';
import {LogPayload, logValidations, validOrLeave} from "../validations";
import {LOGGER} from "../logger.utils";

export const LOG_ROUTES = express.Router();

LOG_ROUTES
  // Post = New
  .post('/', logValidations, validOrLeave, (req, res) => {
    const logObj: LogPayload = req.body;

    LOGGER.error(logObj);
  });
