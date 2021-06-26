import {SettingsState} from "./types";

export function createInitialState (): SettingsState {
  return {
    version: 0,
    config: {
      twitch: {
        channel: '',
        token: '',
      }
    },
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {},
    timers: {}
  }
}
