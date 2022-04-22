import { Component, OnInit } from '@angular/core';
import { BlueprintStepInfo } from "@memebox/logic-step-core";
import { DialogService } from "../../../../../src/app/shared/dialogs/dialog.service";
import { MatDialogRef } from "@angular/material/dialog";
import { MatListOption } from "@angular/material/list";
import { SelectionModel } from "@angular/cdk/collections";
import { AppQueries } from "@memebox/app-state";
import { BlueprintStepCreatorService } from "../blueprint-step-creator.service";

@Component({
  selector: 'app-blueprint-step-selector',
  templateUrl: './blueprint-step-selector.component.html',
  styleUrls: ['./blueprint-step-selector.component.scss']
})
export class BlueprintStepSelectorComponent implements OnInit {
  public possibleSteps = this.stepCreator.possibleSteps;

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<any>,
    private appQuery: AppQueries,
    private stepCreator: BlueprintStepCreatorService
  ) { }

  ngOnInit(): void {
  }

  async save (selectedOptions: SelectionModel<MatListOption>) {

    const selected: BlueprintStepInfo = selectedOptions.selected.map(s => s.value)[0];

    await this.saveByStep(selected);
  }

  async saveByStep (step: BlueprintStepInfo) {
    const createdStep = await this.stepCreator.generateStepData(step);

    if (createdStep) {
       this.dialogRef.close(createdStep);
    }
  }
}
