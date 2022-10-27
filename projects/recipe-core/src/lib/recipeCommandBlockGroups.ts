import {RecipeCommandSelectionGroup} from "./recipe.types";

export const RecipeCommandBlockGroups: Record<string, RecipeCommandSelectionGroup> = {
  generic: {
    label: "Generic",
    order: 1
  },
  memebox: {
    label: "Memebox",
    order: 2
  },
  twitch: {
    label: "Twitch",
    order: 3
  },
  obs: {
    label: "OBS",
    order: 4
  }
};
