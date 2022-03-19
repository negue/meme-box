import {Component, Input, OnInit} from '@angular/core';
import {BlueprintEntry} from "@memebox/logic-step-core";

@Component({
  selector: 'app-blueprint-entry',
  templateUrl: './blueprint-entry.component.html',
  styleUrls: ['./blueprint-entry.component.scss']
})
export class BlueprintEntryComponent implements OnInit {

  @Input()
  public entry!: BlueprintEntry;

  constructor() { }

  ngOnInit(): void {
  }

}
