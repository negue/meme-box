import {deleteItemInDictionary} from "../../../../utils/src/lib/utils";
import {SettingsState} from "../../../../contracts/src/lib/types";

export function deleteClip(data: SettingsState, id: string) {
  deleteItemInDictionary(data.clips, id);

  const screenKeys = Object.keys(data.screen);

  for (const screenKey of screenKeys) {
    const screen = data.screen[screenKey];

    deleteItemInDictionary(screen.clips, id);
  }
}
