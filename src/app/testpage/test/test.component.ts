import { Component, OnInit } from '@angular/core';
import {
  BlueprintContext,
  createBlueprintContext,
  generateCodeByBlueprint
} from "../../../../projects/logic-step-core/src";
import { AppService } from "../../../../projects/app-state/src/lib/state";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  public blueprint: BlueprintContext = createBlueprintContext();

  constructor(
    private appService: AppService
  ) { }

  ngOnInit(): void {
    this.appService.loadState();
  }

  toScriptCode (blueprint: BlueprintContext) {
    return generateCodeByBlueprint(blueprint);
  }
}
