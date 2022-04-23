import {Component, Inject, OnInit} from '@angular/core';
import {BlueprintContext, BlueprintEntry, BlueprintStepInfo, BlueprintSubStepInfo} from "@memebox/logic-step-core";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatListOption} from "@angular/material/list";
import {SelectionModel} from "@angular/cdk/collections";
import {AppQueries} from "@memebox/app-state";
import {BlueprintStepCreatorService} from "../blueprint-step-creator.service";

@Component({
  selector: 'app-blueprint-step-selector',
  templateUrl: './blueprint-step-selector.component.html',
  styleUrls: ['./blueprint-step-selector.component.scss']
})
export class BlueprintStepSelectorComponent implements OnInit {
  public possibleSteps: BlueprintStepInfo[] = [];

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
    this.possibleSteps = this.stepCreator.getPossibleSteps(this.data.entry, this.data.context);
  }

  async save (selectedOptions: SelectionModel<MatListOption>) {

    const selected: BlueprintStepInfo = selectedOptions.selected.map(s => s.value)[0];

    await this.saveByStep(selected);
  }

  async saveByStep (step: BlueprintStepInfo) {
    const createdStep = await this.stepCreator.generateStepData(this.data.entry, step);

    if (createdStep) {
       this.dialogRef.close(createdStep);
    }
  }
}
