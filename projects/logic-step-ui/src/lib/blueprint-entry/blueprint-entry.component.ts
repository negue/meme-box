import {ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import {BlueprintEntry, BlueprintEntryStepCall, BlueprintSubStepInfo} from "@memebox/logic-step-core";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {BlueprintContextDirective} from "../blueprint-context.directive";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {BlueprintStepSelectorComponent} from "../blueprint-step-selector/blueprint-step-selector.component";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {BlueprintStepCreatorService} from "../blueprint-step-creator.service";

@Component({
  selector: 'app-blueprint-entry',
  templateUrl: './blueprint-entry.component.html',
  styleUrls: ['./blueprint-entry.component.scss']
})
export class BlueprintEntryComponent
  implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  @Input()
  public entry!: BlueprintEntry;

  @Input()
  public parent!: BlueprintEntry;

  @Input()
  @HostBinding('class.block')
  public asBlock = false;

  @Input()
  public isRoot = false;

  @Input()
  public editMode = false;

  constructor(
    public context: BlueprintContextDirective,
    private stepCreator: BlueprintStepCreatorService,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.isRoot) {
      this.context.blueprintUpdated.pipe(
        takeUntil(this._destroy$)
      ).subscribe(value => {
        console.info('setting the entry', value);
        this.entry = value;
        this.cd.markForCheck();
      });
    }
  }


  stepRearranged ($event: CdkDragDrop<unknown, unknown>,
                  subStepInfo: BlueprintSubStepInfo) {
    const newPos = $event.currentIndex;
    const oldPos = $event.previousIndex;

    this.context.moveStep(
      oldPos, newPos,
      this.entry, subStepInfo.name
    );
  }

  removeStep (subStep: BlueprintEntry, parent: BlueprintEntry) {
    this.context.removeStep(
      subStep,
      parent
    );
  }

  async addStep (entry: BlueprintEntry, subStepInfo: BlueprintSubStepInfo) {
    const result = this.dialogService.open(BlueprintStepSelectorComponent, {
      data: {
        entry,
        subStepInfo,
        context: this.context.blueprint
      }
    });

    const dialogInstance = result.componentInstance;
    const dialogResult: BlueprintEntryStepCall = await result.afterClosed().toPromise();

    if (dialogResult) {
      this.context.addStep(entry, subStepInfo, dialogResult)
    }
  }

  changeAwaited (entry: BlueprintEntry, $event: MatCheckboxChange) {
    this.context.changeAwaited(entry, $event.checked);
  }

  ngOnDestroy (): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async editStepConfig(entry: BlueprintEntry, parent: BlueprintEntry) {
    if (entry.entryType !== 'step') {
      return;
    }

    const newPayload = await this.stepCreator.editStepData(entry);

    if (newPayload) {
      this.context.changePayload(entry, newPayload);
    }
  }
}
