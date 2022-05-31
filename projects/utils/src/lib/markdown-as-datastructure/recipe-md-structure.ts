import { Action, ActionType } from "@memebox/contracts";
import { mdSection, mdSectionAsTypedObject } from "@memebox/utils";
import { MarkdownStructure, startNewMarkdownStructure } from "./md-structure";
import { RecipeContext } from "@memebox/recipe-core";

export function convertRecipeToMarkdownStructure(
  action: Action
) {
  const recipeObj = action.recipe;

  const mdStructure = startNewMarkdownStructure();
  mdStructure.metadata.title = action.name;
  mdStructure.metadata.type = action.type;
  mdStructure.description = action.description ?? '';

  mdStructure.sections.push(mdSection(
    'recipe', 'json', recipeObj
  ));

  return mdStructure;
}


export function convertMarkdownStructureToRecipe(
  mdStructure: MarkdownStructure,
  targetType: ActionType
): Action {
  const action: Action = {
    id: '',
    type: targetType,
    name: mdStructure.metadata.title as string,
    description: mdStructure.description
  };

  const recipeContext = mdSectionAsTypedObject<RecipeContext>(mdStructure, 'recipe') ?? {
    rootEntry: '',
    entries: {}
  };

  action.recipe = recipeContext;

  return action;
}
