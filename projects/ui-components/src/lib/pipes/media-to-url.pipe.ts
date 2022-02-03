import {Pipe, PipeTransform} from '@angular/core';
import {API_BASE, EXPRESS_BASE} from "@memebox/app-state";
import {Action, ENDPOINTS, SERVER_URL} from "@memebox/contracts";
import {API_PREFIX} from "../../../../../server/constants";

@Pipe({
  name: 'mediaToUrl'
})
export class MediaToUrlPipe implements PipeTransform {

  transform(media: Action, useOldWay = false): string {
    if (media.path?.includes(SERVER_URL) && media.id && !useOldWay) {
      return `${API_BASE}${ENDPOINTS.FILE.PREFIX}${ENDPOINTS.FILE.BY_ID}${media.id}`;
    } else {
      // Online URL (not local) OR new media dialog
      return replaceholder(media.path);
    }
  }
}

function replaceholder (value: string): string{
  if (value) {
    return value.replace(SERVER_URL, `${EXPRESS_BASE}${API_PREFIX}`);
  }

  return '';
}

@Pipe({
  name: 'mediaPathToUrl'
})
export class MediaPathToUrlPipe implements PipeTransform {

  transform(mediaPath: string): string {
    return replaceholder(mediaPath);
  }
}
