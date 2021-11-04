import {deleteItemInDictionary} from "../../../../utils/src/lib/utils";
import {Action, SettingsState} from "../../../../contracts/src/lib/types";
import {uuidv4} from "../../../../utils/src/lib/uuid";


export function addClip(state: SettingsState, clip: Partial<Action>, fillId = false) {
  if (fillId) {
    clip.id = uuidv4();
  }

  state.clips[clip.id] = clip as Action;
}

export function deleteClip(data: SettingsState, id: string) {
  deleteItemInDictionary(data.clips, id);

  const screenKeys = Object.keys(data.screen);

  for (const screenKey of screenKeys) {
    const screen = data.screen[screenKey];

    deleteItemInDictionary(screen.clips, id);
  }
}
