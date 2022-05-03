import {Directive, Input, OnInit, Output} from '@angular/core';
import {filterNil, Store, StoreConfig} from "@datorama/akita";
import {
  BlueprintContext,
  BlueprintEntry,
  BlueprintEntryStepCall,
  BlueprintEntryStepPayload,
  BlueprintSubStepInfo
} from "@memebox/logic-step-core";
import {Observable} from "rxjs";
import {produce} from "immer";
import {skip} from "rxjs/operators";


@Directive({
  selector: 'app-blueprint-entry[blueprintContext]',
  exportAs: 'blueprintContext'
})
@StoreConfig({
  name: 'blueprintContext',
  producerFn: produce
})
export class BlueprintContextDirective
  extends Store<BlueprintContext>
  implements OnInit
{
  @Input()
  public blueprint: BlueprintContext | null = null;

  @Output()
  public readonly blueprintUpdated: Observable<BlueprintEntry> = this._select(store => store.entries[store.rootEntry]).pipe(
    filterNil
  );

  @Output()
  public readonly state$: Observable<BlueprintContext> =
    this._select(store => ({...store}))
      .pipe(
        skip(1),
        filterNil
      );

  constructor (
  ) {
    super({
      rootEntry: '',
      entries: {}
    });
  }

  ngOnInit (): void {
    if (this.blueprint) {
      this.update({
        ...this.blueprint
      });
    }
  }

  public getSubEntries$(parentEntryId: string, subStepLabel: string) {
    return this._select(store => {
      if (!store.entries[parentEntryId]) {
        return [];
      }

      const subStepEntry = store.entries[parentEntryId].subSteps.find(s => s.label === subStepLabel);

      return subStepEntry.entries.map(e => store.entries[e]);
    })
  }

  public moveStep(prevPos: number, newPos: number,
                   parent: BlueprintEntry,
                   parentSubStep: string): void {
    this.update(state => {
      const foundEntry = this.findEntry(state, parent);

      const stepsArrayToMove = foundEntry?.subSteps.find(s => s.label === parentSubStep)?.entries ?? [];

      arraymove(stepsArrayToMove, prevPos, newPos);
    });
  }

  private static addEntryToPath (
    state: BlueprintContext,
    entry: BlueprintEntry
  ) {
    state.entries[entry.id] = entry;
  }

  addStep (entry: BlueprintEntry, subStepInfo: BlueprintSubStepInfo, stepToAdd: BlueprintEntryStepCall): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      const subEntries = foundEntry?.subSteps.find(s => subStepInfo.label === s.label);

      subEntries?.entries.push(stepToAdd.id);

      BlueprintContextDirective.addEntryToPath(state, stepToAdd);
    });
  }

  findEntry (
    state: BlueprintContext,
    entry: BlueprintEntry
  ): BlueprintEntry  {
    if (entry) {
      return state.entries[entry.id];
    } else {
      return state.entries[state.rootEntry];
    }
  }

  changeAwaited(entry: BlueprintEntry, checked: boolean): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      foundEntry.awaited = checked;
    });
  }

  removeStep(subStep: BlueprintEntry, parent: BlueprintEntry): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, parent);

      const stepsArrayToMove = foundEntry?.subSteps.find(s => s.entries.includes(subStep.id))?.entries ?? [];
      const indexOfStep = stepsArrayToMove.indexOf(subStep.id);
      stepsArrayToMove.splice(indexOfStep, 1);

      delete state.entries[subStep.id];
    });
  }

  changePayload(entry: BlueprintEntryStepCall, newPayload: BlueprintEntryStepPayload): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      if (foundEntry.entryType === 'step') {
        foundEntry.payload = newPayload;
      }
    });
  }
}

function arraymove(arr: unknown[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
