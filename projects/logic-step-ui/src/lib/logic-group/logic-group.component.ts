import {Component, OnInit} from '@angular/core';
import {LogicEditorComponent} from "../logic-editor/logic-editor.component";

@Component({
  selector: 'logic-group',
  templateUrl: './logic-group.component.html',
  styleUrls: ['./logic-group.component.css']
})
export class LogicGroupComponent implements OnInit {

  constructor(
    private logicContext: LogicEditorComponent
  ) { }

  ngOnInit(): void {
  }

}
