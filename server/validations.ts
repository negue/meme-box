import {body, validationResult} from "express-validator";
import {ActionType} from "@memebox/contracts";

// TODO refactor those ActionType Checks
// extract or merge with ACTION_CONFIG_FLAGS
export const MediaTypesWithoutPath = [
  ActionType.Widget,
  ActionType.WidgetTemplate,
  ActionType.Script,
  ActionType.PermanentScript,
  ActionType.Recipe
]

export const clipValidations = [
  body('name').isString(),
  body('path').if((value, {req }, ...rest) => {
    const bodyJson = req.body;


    const bodyType: ActionType = bodyJson.type;

    return !MediaTypesWithoutPath.includes(bodyType);
  }).isString(),
  body('type').not().isEmpty(),
  body('playLength').custom((value, {req }, ...rest) => {
    const bodyJson = req.body;


    const bodyType: ActionType = bodyJson.type;

    const playLengthExists = typeof bodyJson.playLength === 'number';

    // playLength is neede for types Picture / iFrame

    if ([ActionType.Picture, ActionType.IFrame].includes(bodyType) && !playLengthExists) {
      return false;
    }

    return true;
  })
];

export const screenValidations = [
  body('name').isString(),
  body('customCss').optional({
    nullable: true
  }).isString()
];

export interface LogPayload {
  message: string;
  filename: string;
  linenumber: string;
  stack: string;
  url: string;
}

export const logValidations = [
  body('message').isString(),
  body('filename').isString().optional(),
  body('linenumber').isString().optional(),
  body('stack').isString(),
  body('url').isString()
];


export function validOrLeave(req, res, next) {
  const errors = validationResult(req).array();
  if (errors.length) {
    return res.status(422).json({ errors });
  }

  next();
}


// no ".."
export function allowedFileUrl(pathToFile: string): boolean  {
  return !pathToFile.includes('..');  // more to add?
}

export const twitchPostValidator = [
  body('clipId').isString(),
  body('name').isString(),
  body('active').isBoolean()
];

export const twitchPutValidator = [
  ...twitchPostValidator,
  body('id').isString(),
];
