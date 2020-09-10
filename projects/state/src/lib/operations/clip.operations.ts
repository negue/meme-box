// TODO why import-alias not working here?!

import {Clip, SettingsState} from "../../../../contracts/src/lib/types";
import {uuidv4} from "../../../../utils/src/lib/uuid";

export function addClip(state: SettingsState, clip: Partial<Clip>) {
  clip.id = uuidv4();
  state.clips[clip.id] = clip as Clip;
}
