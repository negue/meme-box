import {Pipe, PipeTransform} from '@angular/core';
import {AppQueries} from "../../../../projects/app-state/src/lib/state/app.queries";
import {Observable} from "rxjs";
import {clipDataToDynamicIframeContent, DynamicIframeContent} from "@memebox/utils";
import {distinctUntilChanged, filter, map, withLatestFrom} from "rxjs/operators";
import {isEqual} from "lodash";
import {CombinedClip} from "@memebox/contracts";

@Pipe({
  name: 'widgetTemplateData$'
})
export class WidgetTemplatePipe implements PipeTransform {

  constructor(private appQueries: AppQueries) {
  }

  transform(mediaId: string, mediaClipToShow$: Observable<CombinedClip>): Observable<DynamicIframeContent> {
    return mediaClipToShow$.pipe(
      filter(m => !!m),
      withLatestFrom(this.appQueries.actionMap$),
      map(([mediaToShow, clipMap]) => {

        const variableOverrides = mediaToShow.triggerPayload?.overrides?.action?.variables ?? {};

        if (mediaToShow.clip.fromTemplate) {
          const widgetTemplate = clipMap[mediaToShow.clip.fromTemplate];

          const config: DynamicIframeContent = {
            ...clipDataToDynamicIframeContent(widgetTemplate),
            variables: {
              ...mediaToShow.clip.extended,
              ...variableOverrides
            }
          };

          return config;
        }


        const result: DynamicIframeContent =  {
          ...clipDataToDynamicIframeContent(mediaToShow.clip),
          variables: variableOverrides
        };
        console.info({
          mediaToShow,
          result
        });
        return result;
      }),
      distinctUntilChanged((x, y) => isEqual(x, y))
    );
  }
}
