import {Dictionary, HasClipId} from "./types";
import {TriggerBase} from "./trigger.types";
import {SettingsState} from "./types.state";
import {TwitchEventTypes, TwitchTriggerChannelPointData} from "@memebox/contracts";

export interface StateV0 extends SettingsState {
  twitchEvents: Dictionary<TwitchTriggerV0>;
  timers: Dictionary<TimedAction>;
}


export interface TimedAction extends TriggerBase {
  // id => has nothing to do with clipID
  everyXms: number;
  active: boolean;
}

export interface ConfigV0 {
  mediaFolder: string;
  twitchChannel: string;
  twitchLog?: boolean;
}

export interface TwitchTriggerV0 extends  Omit<TriggerBase, 'clipId'>, HasClipId {
  name: string;
  // screenId:      string; // TODO
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  aliases?: string[];

  active: boolean;

  roles: string[]; // maybe enum
  minAmount?: number;
  maxAmount?: number;

  cooldown?: number;
  canBroadcasterIgnoreCooldown?: boolean;

  channelPointId?: string;

  channelPointData?:TwitchTriggerChannelPointData;

  // !magic
  // TODO other options per type
}
