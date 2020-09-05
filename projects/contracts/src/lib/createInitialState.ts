import {SettingsState} from "./types";

export function createInitialState (): SettingsState {
  return {
    config: {},
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {}
  }
}
