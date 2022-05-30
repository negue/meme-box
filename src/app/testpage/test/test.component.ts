import { Component, OnInit } from '@angular/core';
import { createRecipeContext, generateCodeByRecipe, RecipeContext } from "../../../../projects/recipe-core/src";
import { AppService } from "../../../../projects/app-state/src/lib/state";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  public recipe: RecipeContext = createRecipeContext();

  constructor(
    private appService: AppService
  ) { }

  ngOnInit(): void {
    this.appService.loadState();
  }

  toScriptCode (recipeContext: RecipeContext): string  {
    return generateCodeByRecipe(recipeContext);
  }
}
