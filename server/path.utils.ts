import * as fs from "fs";
import path from "path";
import {CLI_OPTIONS} from "./utils/cli-options";

export function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}


// Get the config path (for the settings.json)
// Gets the correct User-AppData Folder
const userDataFolder = process.env.APPDATA ||
  (process.platform == 'darwin'
    ? `${process.env.HOME}/Library/Preferences`
    : `${process.env.HOME}/.local/share`)
;

export const NEW_CONFIG_PATH = CLI_OPTIONS.CONFIG_PATH ?? path.join(userDataFolder, 'meme-box');

createDirIfNotExists(NEW_CONFIG_PATH);

export const LOG_PATH = path.join(NEW_CONFIG_PATH, 'logs');

createDirIfNotExists(LOG_PATH);

