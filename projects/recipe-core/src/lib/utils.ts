import {RecipeContext, RecipeEntryCommandCall} from "./recipe.types";

const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const charactersLength = characters.length;

export function generateRandomCharacters(length: number): string  {
  let result           = '';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function* listAllEntriesOfTypes(
  recipeContext: RecipeContext,
  currentCommandToCheck: string,
  commandTypeList: string[]
): IterableIterator<RecipeEntryCommandCall> {
  const entry = recipeContext.entries[currentCommandToCheck];

  if (entry.entryType === 'command') {
    if (commandTypeList.includes(entry.commandBlockType)) {
      yield entry;
    }
  }

  if (entry.subCommandBlocks?.length > 0) {
    for (const subCommandBlock of entry.subCommandBlocks) {
      for (const subEntry of subCommandBlock.entries) {
        yield *listAllEntriesOfTypes(recipeContext, subEntry, commandTypeList);
      }
    }
  }
}

