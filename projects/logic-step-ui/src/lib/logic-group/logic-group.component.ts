import {Component, Input, TemplateRef} from '@angular/core';
import {LogicEditorComponent} from "../logic-editor/logic-editor.component";
import {AllLogicSteps, LogicStepGroup} from "@memebox/logic-step-core";
import {CdkDragDrop} from "@angular/cdk/drag-drop";

@Component({
  selector: 'logic-group',
  templateUrl: './logic-group.component.html',
  styleUrls: ['./logic-group.component.css']
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

  constructor(
    private logicContext: LogicEditorComponent
  ) { }


  stepRearranged($event: CdkDragDrop<unknown, unknown>) {
    const newPos = $event.currentIndex;
    const oldPos = $event.previousIndex;

    this.logicContext.state.moveStep(newPos, oldPos, this.parent);
  }
}
