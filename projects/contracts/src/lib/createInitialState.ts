import {State} from "./types";

export function createInitialState (): State {
  return {
    config: {},
    twitchEvents: {},
    screen: {},
    clips: {}
  }
}
