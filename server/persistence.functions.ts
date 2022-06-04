import { createDirIfNotExists, MEDIA_SCREENSHOT_PATH, safeResolve } from "./path.utils";
import { Action } from "../projects/contracts/src/lib/types";
import { ActionType } from "../projects/contracts/src/lib/media.types";
import fs, { writeFileSync } from "fs";
import path from "path";

export const GetPreviewFilePath = (actionId: string) => safeResolve(MEDIA_SCREENSHOT_PATH, actionId+'.jpg');

export function SavePreviewFile(action: Action): void  {
  if (action.type === ActionType.Video && action.previewUrl?.includes('data:image/jpeg;base64')) {
    const previewImgBase64 = action.previewUrl.replace('data:image/jpeg;base64,', '');

    writeFileSync(GetPreviewFilePath(action.id), previewImgBase64, 'base64');

    action.previewUrl = null;
    action.hasPreview = true;
  }
}

// TODO change to promise / async
export function saveFile(filePath: string, data: any, stringify = false): void {
  const getDirOfPath = path.dirname(filePath);

  createDirIfNotExists(getDirOfPath);

  fs.writeFileSync(filePath, stringify
    ? JSON.stringify(data, null, '  ')
    : data /*, err => {
    if (err) {
      console.error(`Error on Saving File: ${filePath}`, err);
    }
  }*/);
}
