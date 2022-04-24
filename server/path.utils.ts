import * as fs from "fs";
import path from "path";
import {CLI_OPTIONS} from "./utils/cli-options";

export function createDirIfNotExists(dir: string): void  {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

export function safeResolve(basePath: string, targetFolder: string) {
  const targetPath = '.' + path.normalize('/' + targetFolder)
  return path.resolve(basePath, targetPath)
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

export const MEDIA_SCREENSHOT_PATH = path.join(NEW_CONFIG_PATH, 'media-screenshot');
createDirIfNotExists(MEDIA_SCREENSHOT_PATH);

