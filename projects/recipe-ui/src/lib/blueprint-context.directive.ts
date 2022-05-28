import { Directive, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { filterNil, Store, StoreConfig } from "@datorama/akita";
import {
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload,
  RecipeSubCommandInfo
} from "@memebox/recipe-core";
import { Observable } from "rxjs";
import { produce } from "immer";
import { skip } from "rxjs/operators";


@Directive({
  selector: 'app-blueprint-entry[blueprintContext]',
  exportAs: 'blueprintContext'
})
@StoreConfig({
  name: 'blueprintContext',
  producerFn: produce
})
export class BlueprintContextDirective
  extends Store<RecipeContext>
  implements OnInit, OnChanges
{
  @Input()
  public recipe: RecipeContext | null = null;

  @Output()
  public readonly blueprintUpdated: Observable<RecipeEntry> = this._select(store => store.entries[store.rootEntry]).pipe(
    filterNil
  );

  @Output()
  public readonly state$: Observable<RecipeContext> =
    this._select(store => ({...store}));


  @Output()
  public readonly stateUpdated$: Observable<RecipeContext> =
    this.state$
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
    if (this.recipe) {
      this.update({
        ...this.recipe
      });
    }
  }


  ngOnChanges({recipe}: SimpleChanges): void {
    if (recipe) {
      this.update({
        ...recipe.currentValue
      });
    }
  }

  public getSubEntries$(parentEntryId: string, subStepLabelId: string) {
    return this._select(store => {
      if (!store.entries[parentEntryId]) {
        return [];
      }

      const subStepEntry = store.entries[parentEntryId].subCommandBlocks.find(s => s.labelId === subStepLabelId);

      return subStepEntry.entries.map(e => store.entries[e]);
    })
  }

  public moveStep(prevPos: number, newPos: number,
                   parent: RecipeEntry,
                   parentSubStep: string): void {
    this.update(state => {
      const foundEntry = this.findEntry(state, parent);

      const stepsArrayToMove = foundEntry?.subCommandBlocks.find(s => s.labelId === parentSubStep)?.entries ?? [];

      arraymove(stepsArrayToMove, prevPos, newPos);
    });
  }

  addStep (entry: RecipeEntry, subStepInfo: RecipeSubCommandInfo, stepToAdd: RecipeEntryCommandCall): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      const subEntries = foundEntry?.subCommandBlocks.find(s => subStepInfo.labelId === s.labelId);

      subEntries?.entries.push(stepToAdd.id);

      addEntryToPath(state, stepToAdd);
    });
  }

  findEntry (
    state: RecipeContext,
    entry: RecipeEntry
  ): RecipeEntry  {
    if (entry) {
      return state.entries[entry.id];
    } else {
      return state.entries[state.rootEntry];
    }
  }

  changeAwaited(entry: RecipeEntry, checked: boolean): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      foundEntry.awaited = checked;
    });
  }

  removeStep(subStep: RecipeEntry, parent: RecipeEntry): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, parent);

      const stepsArrayToMove = foundEntry?.subCommandBlocks.find(s => s.entries.includes(subStep.id))?.entries ?? [];
      const indexOfStep = stepsArrayToMove.indexOf(subStep.id);
      stepsArrayToMove.splice(indexOfStep, 1);

      delete state.entries[subStep.id];
    });
  }

  changePayload(entry: RecipeEntryCommandCall, newPayload: RecipeEntryCommandPayload): void  {
    this.update(state => {
      const foundEntry = this.findEntry(state, entry);

      if (foundEntry.entryType === 'step') {
        foundEntry.payload = newPayload;
      }
    });
  }
}

function addEntryToPath (
  state: RecipeContext,
  entry: RecipeEntry
) {
  state.entries[entry.id] = entry;
}

function arraymove(arr: unknown[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
