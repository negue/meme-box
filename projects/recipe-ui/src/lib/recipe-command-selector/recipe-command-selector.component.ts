import {Component, Inject} from '@angular/core';
import {
  RecipeCommandBlockGroups,
  RecipeCommandDefinition,
  RecipeCommandSelectionGroup,
  RecipeContext,
  RecipeEntry,
  RecipeSubCommandInfo
} from "@memebox/recipe-core";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AppQueries} from "@memebox/app-state";
import {RecipeCommandCreatorService} from "../recipe-command-creator.service";
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import {BehaviorSubject} from "rxjs";
import {debounceTime, map, startWith} from "rxjs/operators";

interface RecipeCommandBlockGroup extends RecipeCommandSelectionGroup {
  blocks: RecipeCommandDefinition[];
}

function groupByCommandBlocksType(
  allBlocks: RecipeCommandDefinition[]
) : RecipeCommandBlockGroup[] {
  const groupedByArray  = Object.entries(
    groupBy(allBlocks, 'commandGroup')
  );

  return orderBy( groupedByArray
    .map(([groupName, blocks]) => {
      return {
        ...RecipeCommandBlockGroups[groupName],
        blocks
      } as RecipeCommandBlockGroup;
  }), ['order']);
}

@Component({
  selector: 'app-recipe-command-selector',
  templateUrl: './recipe-command-selector.component.html',
  styleUrls: ['./recipe-command-selector.component.scss']
})
export class RecipeCommandSelectorComponent  {
  private possibleCommandBlocks: RecipeCommandBlockGroup[] =
    groupByCommandBlocksType(
      this.stepCreator.getPossibleCommands(this.data.entry, this.data.context)
    );

  public searchText = '';

  public readonly searchChanged$ = new BehaviorSubject<string>('');
  public readonly possibleCommandBlocks$ = this.searchChanged$.pipe(
    debounceTime(300),
    map(searchTerm => {
      if (searchTerm.length === 0) {
        return this.possibleCommandBlocks;
      }

      searchTerm = searchTerm.toLowerCase().trim();

      return this.possibleCommandBlocks
        .map(g => {
          return {
            ...g,
            blocks: g.blocks.filter(b => b.pickerLabel.toLowerCase().includes(searchTerm))
          }
        })
        .filter(g => g.blocks.length !== 0);
    }),
    startWith(this.possibleCommandBlocks)
  );

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: {
      entry: RecipeEntry;
      subStepInfo: RecipeSubCommandInfo;
      context: RecipeContext
    },
    private appQuery: AppQueries,
    private stepCreator: RecipeCommandCreatorService
  ) { }

  updateSearchField(value: string): void  {
    this.searchText = value;
    this.searchChanged$.next(value);
  }

  async selectCommandBlock(step: RecipeCommandDefinition) {
    if (!step.commandType) {
      return;
    }

    const createdStep = await this.stepCreator.generateCommandData(
      this.data.entry,
      step.commandType,
      this.data.context
    );

    if (createdStep) {
       this.dialogRef.close(createdStep);
    }
  }
}
