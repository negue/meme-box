import {Pipe, PipeTransform} from '@angular/core';
import {AppQueries} from "@memebox/app-state";
import {Observable} from "rxjs";
import {DynamicIframeContent, getWidgetFromActionInfo} from "@memebox/utils";
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
      map(([mediaToShow, actionMap]) => {

        const variableOverrides = mediaToShow.triggerPayload?.overrides?.action?.variables ?? {};

        return getWidgetFromActionInfo(
          mediaToShow.action,
          actionMap,
          variableOverrides
        );
      }),
      distinctUntilChanged((x, y) => isEqual(x, y))
    );
  }
}
