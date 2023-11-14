import {SettingsState, TwitchConfig} from "./types";

export function createInitialTwitchConfig(): TwitchConfig {
  return {
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
  };
}

export function createInitialState (): SettingsState {
  return {
    version: 0,
    config: {
      twitch: createInitialTwitchConfig()
    },
    twitchEvents: {},
    screen: {},
    clips: {},
    tags: {},
    timers: {}
  }
}
