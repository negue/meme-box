import { Component, OnInit } from '@angular/core';
import { createRecipeContext } from "@memebox/recipe-core";
import { AppService } from "@memebox/app-state";
import { RecipeContext } from "@recipe/contracts";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  public recipe: RecipeContext = createRecipeContext();

  constructor(
    private appService: AppService
  ) {
  }

  ngOnInit(): void {
    this.appService.loadState();
  }
}
