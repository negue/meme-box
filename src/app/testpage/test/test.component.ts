import {Component, OnInit} from '@angular/core';
import {createRecipeContext, RecipeContext} from "@memebox/recipe-core";
import {AppService} from "@memebox/app-state";

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
}
