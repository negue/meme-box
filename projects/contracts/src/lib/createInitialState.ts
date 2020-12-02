import {SettingsState} from "./types";

export function createInitialState (): SettingsState {
  return {
    version: 0,
    config: {
      twitch: {
        channel: '',
      }
    },
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {},
    timers: {}
  }
}
