import {Pipe, PipeTransform} from '@angular/core';
import {AppQueries} from "../../state/app.queries";
import {Clip} from "@memebox/contracts";
import {Observable, of} from "rxjs";
import {clipDataToDynamicIframeContent, DynamicIframeContent} from "@memebox/utils";
import {map} from "rxjs/operators";

@Pipe({
  name: 'clipTemplate$'
})
export class ClipTemplatePipe implements PipeTransform {

  constructor(private appQueries: AppQueries) {
  }

  transform(value: Clip): Observable<DynamicIframeContent> {
    if (value.fromTemplate) {
      return this.appQueries.clipMap$.pipe(
        map(clipMap => clipMap[value.fromTemplate]),
        map(template => {
          const config: DynamicIframeContent = {
            ...clipDataToDynamicIframeContent(template),
            variables: value.extended
          };

          console.info({config, value});

          return config;
        })
      );
    }

    return of(clipDataToDynamicIframeContent(value));
  }

}
