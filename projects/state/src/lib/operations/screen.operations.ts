import {PositionEnum, Screen, ScreenClip, SettingsState, VisibilityEnum} from "../../../../contracts/src/lib/types";
import {uuidv4} from "../../../../utils/src/lib/uuid";

// It needs to be a new object
// otherwise it would take the clips refernce
// and add clips to it all the time
function createInitialScreenObj(): Screen {
  return {
    id: '',
    name: '',
    clips: {},
    height: 1080,
    width: 1920
  };
}

function createInitialScreenClipObj(): ScreenClip {
  return {
    visibility: VisibilityEnum.Play,
    position: PositionEnum.FullScreen,
    id: '',
    // imgFit: todo Object/Image Fit Enum
  }
}

// region Screen Operations

export function addScreen(state: SettingsState, screen: Partial<Screen>) {
  screen.id = uuidv4();
  state.screen[screen.id] = Object.assign(createInitialScreenObj(), screen);
}

// endregion

// region Screen Clip Operations

export function addScreenClip(state: SettingsState, screenId: string, screenClip: Partial<ScreenClip>) {
  state.screen[screenId].clips[screenClip.id] = Object.assign(createInitialScreenClipObj(), screenClip);
}

// endregion



