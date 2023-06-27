import {Dictionary, HasClipId} from "./types";
import {TimedAction, TwitchTrigger} from "./trigger.types";
import {SettingsState} from "./types.state";

export interface StateV0 extends SettingsState {
  twitchEvents: Dictionary<TwitchTrigger>;
  timers: Dictionary<TimedAction>;
}

export interface ConfigV0 {
  mediaFolder: string;
  twitchChannel: string;
  twitchLog?: boolean;
}

export interface TwitchTriggerV0 extends TwitchTrigger, HasClipId {

}

export interface TimedTriggerV0 extends TimedAction, HasClipId {


}
