import {Component, OnInit} from '@angular/core';
import {LogicEditorComponent} from "../logic-editor/logic-editor.component";

@Component({
  selector: 'logic-call',
  templateUrl: './logic-call.component.html',
  styleUrls: ['./logic-call.component.css']
})
export class LogicCallComponent implements OnInit {

  constructor(
    private logicContext: LogicEditorComponent
  ) { }

  ngOnInit(): void {
  }

}
