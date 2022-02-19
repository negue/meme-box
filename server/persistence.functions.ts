import { MEDIA_SCREENSHOT_PATH, safeResolve } from "./path.utils";
import { Action } from "../projects/contracts/src/lib/types";
import { ActionType } from "../projects/contracts/src/lib/media.types";
import { writeFileSync } from "fs";

export const GetPreviewFilePath = (actionId: string) => safeResolve(MEDIA_SCREENSHOT_PATH, actionId+'.jpg');

export function SavePreviewFile(action: Action) {
  if (action.type === ActionType.Video && action.previewUrl?.includes('data:image/jpeg;base64')) {
    const previewImgBase64 = action.previewUrl.replace('data:image/jpeg;base64,', '');

    writeFileSync(GetPreviewFilePath(action.id), previewImgBase64, 'base64');

    action.previewUrl = null;
    action.hasPreview = true;
  }
}
