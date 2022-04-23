import {Directive, Input, OnInit, Output} from '@angular/core';
import {filterNil, Store, StoreConfig} from "@datorama/akita";
import {BlueprintContext, BlueprintEntry, BlueprintEntryStepCall, BlueprintSubStepInfo} from "@memebox/logic-step-core";
import {Observable} from "rxjs";
import {produce} from "immer";


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
  public blueprintUpdated: Observable<BlueprintEntry> = this._select(store => store.entries[store.rootEntry]).pipe(
    filterNil
  );

  @Output()
  public state$: Observable<BlueprintContext> = this._select(store => ({...store})).pipe(
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
      console.info('setting to blueprint', this.blueprint);
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

  private addEntryToPath (
    state: BlueprintContext,
    entry: BlueprintEntry
  ) {
    state.entries[entry.id] = entry;
  }

  addStep (entry: BlueprintEntry, subStepInfo: BlueprintSubStepInfo, stepToAdd: BlueprintEntryStepCall) {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      const subEntries = foundEntry?.subSteps.find(s => subStepInfo.label === s.label);

      console.info({
        entry,
        foundEntry,
        subEntries,
        subStepInfo
      });

      subEntries?.entries.push(stepToAdd.id);

      this.addEntryToPath(state, stepToAdd);
    });
  }

  findEntry (
    state: BlueprintContext,
    entry: BlueprintEntry
  ) {
    return state.entries[entry.id];
  }

  changeAwaited(entry: BlueprintEntry, checked: boolean) {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      foundEntry.awaited = checked;
    });
  }
}

function arraymove(arr: unknown[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function deProxify(obj: unknown) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.info(e, obj);

    return obj;
  }
}
