import {deleteItemInDictionary} from "@memebox/utils";
import {Action, SettingsState} from "@memebox/contracts";
import {uuid} from "@gewd/utils";


export function addAction(state: SettingsState, clip: Partial<Action>, fillId = false): void  {
  if (fillId) {
    clip.id = uuid();
  }

  state.clips[clip.id] = clip as Action;
}

export function deleteAction(data: SettingsState, id: string): void  {
  deleteItemInDictionary(data.clips, id);

  const screenKeys = Object.keys(data.screen);

  for (const screenKey of screenKeys) {
    const screen = data.screen[screenKey];

    deleteItemInDictionary(screen.clips, id);
  }
}
