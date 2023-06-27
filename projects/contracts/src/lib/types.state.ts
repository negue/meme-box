import {Action, Config, Dictionary, FileInfo, Screen, Tag, UserDataState} from "./types";
import {TriggerConfig} from "./trigger.types";

/**
 * Settings.json - State
 *
 * Persistent State
 */
export interface SettingsState {
  version: number;
  clips: Dictionary<Action>;
  triggers: Dictionary<TriggerConfig>;
  screen: Dictionary<Screen>;
  tags: Dictionary<Tag>;

  config: Partial<Config>;
}

export interface UpdateState {
  available: boolean,
  version: string;
}

export interface ServerState {
  update: UpdateState;
}

export interface AppState extends SettingsState {
  currentMediaFiles: FileInfo[];
  offlineMode: boolean;
  update: UpdateState;
}

export function getUserDataState (settings: SettingsState): UserDataState {
  return {
    actions: settings.clips,
    screen: settings.screen,
    tags: settings.tags
  }
}
