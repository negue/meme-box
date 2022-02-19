import {Pipe, PipeTransform} from '@angular/core';
import {Action} from "@memebox/contracts";
import {actionDataToWidgetContent, DynamicIframeContent} from "../../../../utils/src/lib/dynamicIframe";

@Pipe({
  name: 'clipToIframe'
})
export class ClipToIframePipe implements PipeTransform {

  transform(value: Action): DynamicIframeContent {
    return actionDataToWidgetContent(value);
  }

}
