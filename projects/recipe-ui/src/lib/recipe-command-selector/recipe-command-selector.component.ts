import {Component, Inject, OnInit} from '@angular/core';
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
export class RecipeCommandSelectorComponent implements OnInit {
  public possibleCommandBlocks: RecipeCommandBlockGroup[] = [];

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

  ngOnInit(): void {
    this.possibleCommandBlocks =
      groupByCommandBlocksType(
        this.stepCreator.getPossibleCommands(this.data.entry, this.data.context)
      );
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
