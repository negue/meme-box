import {Injectable} from "@angular/core";
import {Query, Store} from "@datorama/akita";
import {produce} from "immer";
import {AllLogicSteps, generateCodeBySteps, LogicVariable} from "./generator";
import {LogicContextMetadataQuery} from "./logic-context-metadata.service";
import {combineLatest} from "rxjs";
import {debounceTime, map} from "rxjs/operators";

interface LogicContextStateType {

  // todo replace as its own logic step?
  staticVariables: LogicVariable[];
  // todo refactor to keyvalue/easier access for each item
  // for now order = array position
  steps: AllLogicSteps[];
}



@Injectable({
  providedIn: "any"
})
export class LogicContextState extends Store<LogicContextStateType> {

  constructor(
  ) {
    super({
      staticVariables: [],
      steps: []
    }, {
      producerFn: produce
    });
  }

  public registerVariables(...variablesToRegister: LogicVariable[]): void {
    this.update(state => {
      for (const data of variablesToRegister) {
        state.staticVariables.push(data);
      }
    });
  }

  public updateVariable(variableToUpdate: LogicVariable): void {
    this.update(state => {
      const indexOf = state.staticVariables.findIndex(variable => variable.id === variableToUpdate.id);

      state.staticVariables.splice(indexOf, 1, variableToUpdate);
    });
  }

  public deleteVariable(variableId: string): void {
    this.update(state => {
      const indexOf = state.staticVariables.findIndex(variable => variable.id === variableId);

      state.staticVariables.splice(indexOf, 1);
    });
  }
}

@Injectable({
  providedIn: "any"
})
export class LogicContextStateQuery extends Query<LogicContextStateType> {
  public currentLogicSteps$ = this.select(state => state.steps);
  public nonGlobalVariables$ = this.select(state => state.staticVariables.filter(variable => !variable.isGlobal));

  public allPossibleTypes$ = this.logicContextMetadata.select(meta => {
    const allEntries = Object.values(meta);

    return allEntries.map(metaEntry => metaEntry.typeName);
  });

  public generatedSourceCode$ = combineLatest([
    this.logicContextMetadata.select(),
    this.select()
  ]).pipe(
    debounceTime(250),
    map(([metadata, context]) => generateCodeBySteps(
      context.steps,
      context.staticVariables,
      metadata))
  )


  constructor(protected store: LogicContextState,
              private logicContextMetadata: LogicContextMetadataQuery) {
    super(store);
  }
}
