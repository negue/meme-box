import {Pipe, PipeTransform} from '@angular/core';
import {AppQueries} from "../../state/app.queries";
import {Observable} from "rxjs";
import {clipDataToDynamicIframeContent, DynamicIframeContent} from "@memebox/utils";
import {distinctUntilChanged, map} from "rxjs/operators";
import {isEqual} from "lodash";

@Pipe({
  name: 'clipTemplate$'
})
export class ClipTemplatePipe implements PipeTransform {

  constructor(private appQueries: AppQueries) {
  }

  transform(mediaId: string): Observable<DynamicIframeContent> {
    return this.appQueries.clipMap$.pipe(
      map(clipMap => {
        const selectedMedia = clipMap[mediaId];

        if (selectedMedia.fromTemplate) {
          const widgetTemplate = clipMap[selectedMedia.fromTemplate];

          const config: DynamicIframeContent = {
            ...clipDataToDynamicIframeContent(widgetTemplate),
            variables: selectedMedia.extended
          };

          return config;
        }

        return clipDataToDynamicIframeContent(selectedMedia);
      }),
      distinctUntilChanged((x, y) => isEqual(x, y))
    );
  }
}
