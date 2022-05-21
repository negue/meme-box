import {Component, Inject, OnInit} from '@angular/core';
import {
  BlueprintCommandBlockGroups,
  BlueprintContext,
  BlueprintEntry,
  BlueprintStepDefinition,
  BlueprintStepSelectionGroup,
  BlueprintSubStepInfo
} from "@memebox/logic-step-core";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AppQueries} from "@memebox/app-state";
import {BlueprintStepCreatorService} from "../blueprint-step-creator.service";
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';

interface BlueprintCommandBlockGroup extends BlueprintStepSelectionGroup {
  blocks: BlueprintStepDefinition[];
}

function groupByCommandBlocksType(
  allBlocks: BlueprintStepDefinition[]
) : BlueprintCommandBlockGroup[] {
  const groupedByArray  = Object.entries(groupBy(allBlocks, 'stepGroup'));

  return orderBy( groupedByArray
    .map(([groupName, blocks]) => {
      return {
        ...BlueprintCommandBlockGroups[groupName],
        blocks
      } as BlueprintCommandBlockGroup;
  }), ['order']);
}

@Component({
  selector: 'app-blueprint-step-selector',
  templateUrl: './blueprint-step-selector.component.html',
  styleUrls: ['./blueprint-step-selector.component.scss']
})
export class BlueprintStepSelectorComponent implements OnInit {
  public possibleCommandBlocks: BlueprintCommandBlockGroup[] = [];

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: {
      entry: BlueprintEntry;
      subStepInfo: BlueprintSubStepInfo;
      context: BlueprintContext
    },
    private appQuery: AppQueries,
    private stepCreator: BlueprintStepCreatorService
  ) { }

  ngOnInit(): void {
    this.possibleCommandBlocks =
      groupByCommandBlocksType(
        this.stepCreator.getPossibleSteps(this.data.entry, this.data.context)
      );
  }

  async selectCommandBlock(step: BlueprintStepDefinition) {
    if (!step.stepType) {
      return;
    }

    const createdStep = await this.stepCreator.generateStepData(this.data.entry, step.stepType);

    if (createdStep) {
       this.dialogRef.close(createdStep);
    }
  }
}
