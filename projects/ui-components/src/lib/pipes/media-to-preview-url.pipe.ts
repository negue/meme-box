import {Pipe, PipeTransform} from '@angular/core';
import {API_BASE, EXPRESS_BASE} from "@memebox/app-state";
import {Action, ActionType, ENDPOINTS, SERVER_URL} from "@memebox/contracts";
import {API_PREFIX} from "../../../../../server/constants";

@Pipe({
  name: 'mediaToPreviewUrl'
})
export class MediaToPreviewUrlPipe implements PipeTransform {

  transform(media: Action, useOldWay = false): string {
    if (media.type == ActionType.Video && media.hasPreview) {
      return `${API_BASE}${ENDPOINTS.FILE.PREFIX}${ENDPOINTS.FILE.PREVIEW}${media.id}`;
    }

    const pathToPreview = media.type === ActionType.Video
      ? media.previewUrl
      : (media.previewUrl || media.path);

    if (pathToPreview?.includes(SERVER_URL) && media.id && !useOldWay) {
      return `${API_BASE}${ENDPOINTS.FILE.PREFIX}${ENDPOINTS.FILE.BY_ID}${media.id}`;
    } else {
      // Online URL (not local) OR new media dialog
      return replaceholder(pathToPreview);
    }
  }

}

function replaceholder (value: string): string{
  if (value) {
    return value.replace(SERVER_URL, `${EXPRESS_BASE}${API_PREFIX}`);
  }

  return '';
}
