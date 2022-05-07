import {Pipe, PipeTransform} from '@angular/core';
import {AppQueries} from "@memebox/app-state";
import {Observable} from "rxjs";
import {actionDataToWidgetContent, DynamicIframeContent} from "@memebox/utils";
import {distinctUntilChanged, filter, map, withLatestFrom} from "rxjs/operators";
import {isEqual} from "lodash";
import {CombinedActionContext} from "@memebox/contracts";

@Pipe({
  name: 'widgetTemplateData$'
})
export class WidgetTemplatePipe implements PipeTransform {

  constructor(private appQueries: AppQueries) {
  }

  transform(mediaId: string, mediaClipToShow$: Observable<CombinedActionContext>): Observable<DynamicIframeContent> {
    return mediaClipToShow$.pipe(
      filter(m => !!m),
      withLatestFrom(this.appQueries.actionMap$),
      map(([mediaToShow, clipMap]) => {

        const variableOverrides = mediaToShow.triggerPayload?.overrides?.action?.variables ?? {};

        if (mediaToShow.action.fromTemplate) {
          const widgetTemplate = clipMap[mediaToShow.action.fromTemplate];

          const config: DynamicIframeContent = {
            ...actionDataToWidgetContent(widgetTemplate),
            variables: {
              ...mediaToShow.action.extended,
              ...variableOverrides
            }
          };

          return config;
        }

        const result: DynamicIframeContent =  {
          ...actionDataToWidgetContent(mediaToShow.action),
          variables: variableOverrides
        };

        return result;
      }),
      distinctUntilChanged((x, y) => isEqual(x, y))
    );
  }
}
