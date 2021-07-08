import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScriptVariable} from "@memebox/utils";

@Component({
  selector: 'app-variables-config',
  templateUrl: './variables-config.component.html',
  styleUrls: ['./variables-config.component.scss']
})
export class VariablesConfigComponent implements OnInit {

  @Input()
  public variablesList: ScriptVariable[] = [];

  @Output()
  public onAddNewVariable = new EventEmitter();

  @Output()
  public onEditVariable = new EventEmitter<ScriptVariable>();

  @Output()
  public onDeleteVariable = new EventEmitter<ScriptVariable>();

  constructor() { }

  ngOnInit(): void {
  }
}
