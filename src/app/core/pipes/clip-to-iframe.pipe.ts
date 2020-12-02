import {Pipe, PipeTransform} from '@angular/core';
import {Clip} from "@memebox/contracts";
import {clipDataToDynamicIframeContent, DynamicIframeContent} from "../../../../projects/utils/src/lib/dynamicIframe";

@Pipe({
  name: 'clipToIframe'
})
export class ClipToIframePipe implements PipeTransform {

  transform(value: Clip): DynamicIframeContent {
    return clipDataToDynamicIframeContent(value);
  }

}
