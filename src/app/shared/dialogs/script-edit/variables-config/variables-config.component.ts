import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DynamicIframeVariable} from "@memebox/utils";

@Component({
  selector: 'app-variables-config',
  templateUrl: './variables-config.component.html',
  styleUrls: ['./variables-config.component.scss']
})
export class VariablesConfigComponent implements OnInit {

  @Input()
  public variablesList: DynamicIframeVariable[] = [];

  @Output()
  public onAddNewVariable = new EventEmitter();

  @Output()
  public onEditVariable = new EventEmitter<DynamicIframeVariable>();

  @Output()
  public onDeleteVariable = new EventEmitter<DynamicIframeVariable>();

  constructor() { }

  ngOnInit(): void {
  }
}
