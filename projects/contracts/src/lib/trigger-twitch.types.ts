import {ChatUserstate} from "tmi.js";
import {AllTwitchEvents, DefaultImage, TriggerConfig} from "@memebox/contracts";

interface SharedTwitchTriggerConfig extends TriggerConfig {
  argumentValues: {
    cooldown?: number,
    ignoreBroadcasterCooldown: boolean
  }
}

export interface TwitchSubscriptionTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.sub';
}

export interface TwitchGiftSubscriptionTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.giftsub';
}

export interface TwitchBanTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.ban';
}

export interface TwitchCheerTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.cheer';

  argumentValues: SharedTwitchTriggerConfig['argumentValues'] & {
    min_bits: number,
    max_bits: number
  }
}

export interface TwitchRaidTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.raid';

  argumentValues: SharedTwitchTriggerConfig['argumentValues'] & {
    min_viewer: number,
    max_viewer: number
  }
}


export interface TwitchMessageTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.message';

  argumentValues: SharedTwitchTriggerConfig['argumentValues'] & {
    message: string,
    aliasList: string[],
    twitchRoles: string[]
  }
}

export interface TwitchChannelPointTriggerConfig extends SharedTwitchTriggerConfig {
  type: 'twitch.channelpoint';

  argumentValues: SharedTwitchTriggerConfig['argumentValues'] & {
    channelPointId: string,
  }

  channelPointData?:TwitchTriggerChannelPointData;
}

export type TypedTwitchTriggerConfigs =
  | TwitchSubscriptionTriggerConfig
  | TwitchGiftSubscriptionTriggerConfig
  | TwitchBanTriggerConfig
  | TwitchMessageTriggerConfig
  | TwitchChannelPointTriggerConfig
  | TwitchRaidTriggerConfig
  | TwitchCheerTriggerConfig;

export interface TwitchTriggerCommand {
  config: TypedTwitchTriggerConfigs;
  tags?: ChatUserstate;
  twitchEvent?: AllTwitchEvents;
}

export interface TwitchTriggerChannelPointData {
  id: string;
  image?: null;
  background_color: string;
  cost: number;
  title: string;
  default_image: DefaultImage;
}
export enum TwitchEventTypes {
  message = 'message',
  follow = 'follow',
  bits = 'bits',
  raid = 'raid',
  host = 'host',
  channelPoints = 'channelPoints',
  ban = 'ban',
  subscription = "subscription",
  gift = "gift"
}

export interface TwitchEventFields {
  [event:string]: {
    fields: {
      minValue?: { enable: boolean, placeholder?: string},
      maxValue?: { enable: boolean, placeholder?: string},
      channelPointId?: { enable: boolean }
    }
  }
}


export const TwitchTypesArray = [
  // TwitchEventTypes.follow,
  TwitchEventTypes.bits,
  TwitchEventTypes.channelPoints,
  // TwitchEventTypes.host,
  TwitchEventTypes.message,
  TwitchEventTypes.raid,
  TwitchEventTypes.ban,
  TwitchEventTypes.subscription,
  TwitchEventTypes.gift
];
