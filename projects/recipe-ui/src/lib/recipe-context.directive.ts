import {Directive, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {filterNil, Store, StoreConfig} from "@datorama/akita";
import {
  RecipeContext,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeEntryCommandPayload,
  RecipeSubCommandInfo
} from "@memebox/recipe-core";
import {Observable} from "rxjs";
import {produce} from "immer";
import {skip, take} from "rxjs/operators";
import {arraymove} from "@memebox/utils";
import {getUserDataState, UserDataState} from "@memebox/contracts";
import {AppQueries} from "@memebox/app-state";

function addEntryToPath (
  state: RecipeContext,
  entry: RecipeEntry
) {
  state.entries[entry.id] = entry;
}

@Directive({
  selector: 'app-recipe-block[recipeContext]',
  exportAs: 'recipeContext'
})
@StoreConfig({
  name: 'recipeContext',
  producerFn: produce
})
export class RecipeContextDirective
  extends Store<RecipeContext>
  implements OnInit, OnChanges
{
  public userData: UserDataState| null = null;

  @Input()
  public recipe: RecipeContext | null = null;

  @Output()
  public readonly recipeUpdated: Observable<RecipeEntry> = this._select(store => store.entries[store.rootEntry]).pipe(
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
    private appQueries: AppQueries
  ) {
    super({
      rootEntry: '',
      entries: {}
    });
  }

  async ngOnInit (): Promise<void> {
    if (this.recipe) {
      this.update({
        ...this.recipe
      });
    }

    const currentState = await this.appQueries.state$.pipe(
      take(1)
    ).toPromise();

    this.userData = getUserDataState(currentState);
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

      return subStepEntry?.entries.map(e => store.entries[e]) ?? [];
    })
  }

  public moveStep(prevPos: number, newPos: number,
                  parent: RecipeEntry,
                  parentSubStepLabelId: string): void {
    this.update(state => {
      const foundEntry = this.findEntry(state, parent);

      const stepsArrayToMove = foundEntry?.subCommandBlocks.find(s => s.labelId === parentSubStepLabelId)?.entries ?? [];

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

      if (foundEntry.entryType === 'command') {
        foundEntry.payload = newPayload;
      }
    });
  }
}
