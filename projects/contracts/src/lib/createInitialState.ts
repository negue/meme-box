import {SettingsState} from "./types.state";

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
          command: '!commands',
          auth: {
            name: '',
            token: ''
          }
        }
      },
    },
    triggers: {},
    screen: {},
    clips: {},
    tags: {},
  }
}
