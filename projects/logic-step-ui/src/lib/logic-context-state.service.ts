import {Injectable} from "@angular/core";
import {Query, Store, StoreConfig} from "@datorama/akita";
import {produce} from "immer";
import {
  AllLogicSteps,
  generateCodeBySteps,
  generateVariables,
  LogicStepCall,
  LogicStepGroup,
  LogicVariable
} from "@memebox/logic-step-core";
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
@StoreConfig({ name: 'logicContextState', producerFn: produce })
export class LogicContextState extends Store<LogicContextStateType> {

  constructor(
  ) {
    super({
      staticVariables: [],
      steps: []
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

  public addStep(step: LogicStepCall, parent: LogicStepGroup|null = null) {
    this.update(state => {
      const stepsArrayToAdd = this.findTargetGroupSteps(state.steps, parent);

      stepsArrayToAdd.push(step);
    });
  }

  public addGroup(step: LogicStepGroup, parent: LogicStepGroup|null = null) {
    this.update(state => {
      const stepsArrayToAdd = this.findTargetGroupSteps(state.steps, parent);

      stepsArrayToAdd.push(step);
    });
  }

  public moveStep(prevPos: number, newPos: number, parent: LogicStepGroup|null = null): void {
    this.update(state => {
      const stepsArrayToMove = this.findTargetGroupSteps(state.steps, parent);

      arraymove(stepsArrayToMove, prevPos, newPos);
    });
  }

  updateCallStep(stepToUpdate: LogicStepCall, parent: LogicStepGroup | null) {
    this.update(state => {
      const stepsArrayToUpdate = this.findTargetGroupSteps(state.steps, parent);

      const indexOf = stepsArrayToUpdate.findIndex(step => step.id === stepToUpdate.id);

      stepsArrayToUpdate.splice(indexOf, 1, stepToUpdate);
    });
  }

  // todo refactor the state to find items more easier
  private findTargetGroupSteps (allSteps: AllLogicSteps[], parent: LogicStepGroup|null) {
    if (parent === null) {
      return allSteps;
    }

    const inList = allSteps.find(step => step.id === parent.id);

    if (inList) {
      return (inList as LogicStepGroup).steps;
    }

    for (const subStep of allSteps) {
      if (subStep.logicStepType !== 'group') {
        continue;
      }

      const foundIt = this.findTargetGroupSteps(subStep.steps, parent);

      if (foundIt) {
        return foundIt;
      }
    }

    throw new Error('Group not found');
  }

}

@Injectable({
  providedIn: "any"
})
export class LogicContextStateQuery extends Query<LogicContextStateType> {
  public currentLogicSteps$ = this.select(state => state.steps);
  public allVariables$ = this.select(state => state.staticVariables);
  public nonGlobalVariables$ = this.select(state => state.staticVariables.filter(variable => !variable.isGlobal));

  public allPossibleTypes$ = this.logicContextMetadata.select(meta => {
    const allEntries = Object.values(meta);

    return allEntries.map(metaEntry => metaEntry.typeName);
  });

  // todo remove again?
  public generatedSourceCode$ = combineLatest([
    this.logicContextMetadata.select(),
    this.select()
  ]).pipe(
    debounceTime(250),
    map(([metadata, context]) => {
      const variableDeclarationCode = generateVariables(
        context.staticVariables,
        metadata
      );

      const stepCode = generateCodeBySteps(
        context.steps,
        context.staticVariables,
        metadata);

      return [variableDeclarationCode, stepCode].join('\n');
    })
  )


  constructor(protected store: LogicContextState,
              private logicContextMetadata: LogicContextMetadataQuery) {
    super(store);
  }
}

function arraymove(arr: unknown[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
