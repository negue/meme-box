import {Component, Input, TemplateRef} from '@angular/core';
import {AllLogicSteps, LogicStepGroup} from "@memebox/logic-step-core";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {LogicContextState} from "../logic-context-state.service";

@Component({
  selector: 'logic-group',
  templateUrl: './logic-group.component.html',
  styleUrls: ['./logic-group.component.scss']
})
export class LogicGroupComponent {
  @Input()
  public steps!: AllLogicSteps[];

  @Input()
  public parent: LogicStepGroup| null = null;

  @Input()
  stepTemplate!: TemplateRef<unknown>;

  @Input()
  addActionsTemplate!: TemplateRef<unknown>;

  @Input()
  context!: LogicContextState;

  constructor() { }


  stepRearranged($event: CdkDragDrop<unknown, unknown>) {
    const newPos = $event.currentIndex;
    const oldPos = $event.previousIndex;

    this.context.moveStep(newPos, oldPos, this.parent);
  }
}
