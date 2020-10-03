import {body, validationResult} from "express-validator";
import {MediaType} from "../projects/contracts/src/lib/media.types";

export const clipValidations = [
  body('name').isString(),
  body('path').isString(),
  body('type').not().isEmpty(),
  body('playLength').custom((value, {req }, ...rest) => {
    const bodyJson = req.body;


    const bodyType: MediaType = bodyJson.type;

    const playLengthExists = typeof bodyJson.playLength === 'number';

    // playLength is neede for types Picture / iFrame

    if ([MediaType.Picture, MediaType.IFrame].includes(bodyType) && !playLengthExists) {
      return false;
    }

    return true;
  })
];

export function validOrLeave(req, res, next) {
  const errors = validationResult(req).array();
  if (errors.length) {
    return res.status(422).json({ errors });
  }

  next();
}
