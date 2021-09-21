import {SettingsState} from "./types";

export function createInitialState (): SettingsState {
  return {
    version: 0,
    config: {
      twitch: {
        channel: '',
        token: '',
        bot: {
          enabled: false,
          response: null,
          auth: {
            name: '',
            token: ''
          }
        }
      },
    },
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {},
    timers: {}
  }
}
