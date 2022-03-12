import {Pipe, PipeTransform} from '@angular/core';
import {LogicContextMetadataQuery, LogicContextStateQuery, LogicTypeMethod} from "@memebox/logic-step-core";
import {Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";

@Pipe({
  name: 'logicStepMethodList$'
})
export class LogicStepMethodListPipe implements PipeTransform {

  constructor(
    private logicContext: LogicContextStateQuery,
    private metadata: LogicContextMetadataQuery
  ) {
  }

  transform(variableName: string): Observable<LogicTypeMethod[]> {
    return this.logicContext.select(state => state.staticVariables).pipe(
      switchMap(variables => {
        const foundVariable = variables.find(v => v.name === variableName);

        if (!foundVariable) {
          return of([]);
        }

        return this.metadata.select(store => store[foundVariable.typeName].methods)
      })
    );
  }
}
