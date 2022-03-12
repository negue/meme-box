import {Pipe, PipeTransform} from '@angular/core';
import {
  LogicContextMetadataQuery,
  LogicContextStateQuery,
  LogicStepCall,
  LogicTypeMethodArgument
} from "@memebox/logic-step-core";
import {Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";

@Pipe({
  name: 'logicMethodArguments$'
})
export class LogicMethodArgumentsPipe implements PipeTransform {


  constructor(
    private logicContext: LogicContextStateQuery,
    private metadata: LogicContextMetadataQuery
  ) {
  }

  transform(logicStep: LogicStepCall): Observable<LogicTypeMethodArgument[]> {
    return this.logicContext.select(state => state.staticVariables).pipe(
      switchMap(variables => {
        const foundVariable = variables.find(v => v.name === logicStep.stepVariableName);

        if (!foundVariable) {
          return of([]);
        }

        return this.metadata.select(store => {
            const methods = store[foundVariable.typeName].methods;

            const foundMethod = methods.find(m => m.name === logicStep.methodToCall);

            if (!foundMethod) {
              return [];
            }

            return foundMethod.arguments;
        })
      })
    );
  }

}
