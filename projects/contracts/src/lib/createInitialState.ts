import {State} from "./types";

export function createInitialState (): State {
  return {
    config: {},
    twitchEvents: {},
    obsUrls: {},
    clips: {}
  }
}
