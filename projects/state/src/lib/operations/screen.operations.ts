import {Screen, ScreenClip, SettingsState} from "../../../../contracts/src/lib/types";
import {uuidv4} from "../../../../utils/src/lib/uuid";

const initialScreenObj: Screen = Object.freeze({
  id: '',
  name: '',
  clips: {}
});

// region Screen Operations

export function addScreen(state: SettingsState, screen: Partial<Screen>) {
  screen.id = uuidv4();
  state.screen[screen.id] = Object.assign({}, initialScreenObj, screen);
}

// endregion

// region Screen Clip Operations

export function addScreenClip(state: SettingsState, screenId: string, screenClip: ScreenClip) {
  state.screen[screenId].clips[screenClip.id] = screenClip;
}

// endregion



