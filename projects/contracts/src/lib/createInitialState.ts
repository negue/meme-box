import {SettingsState} from "./types";

export function createInitialState (): SettingsState {
  return {
    config: {
      twitch: {
        bot: false,
        botName: '',
        botToken: '',
        botResponse: 'Hey {{user}} the commands are: {{commands}}'
      }
    },
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {},
    timers: {}
  }
}
