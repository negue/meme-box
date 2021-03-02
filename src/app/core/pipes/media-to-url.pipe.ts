import {Pipe, PipeTransform} from '@angular/core';
import {EXPRESS_BASE} from "../../state/app.service";

@Pipe({
  name: 'mediaToUrl'
})
export class MediaToUrlPipe implements PipeTransform {

  transform(mediaId: string): string {
    return `${EXPRESS_BASE}/fileById/${mediaId}`;
  }

}
