import {ChatUserstate, SubMethods} from "tmi.js";
import {AllTwitchTriggerConfigTypes, TypedTwitchTriggerConfigs} from "./trigger-twitch.types";
import {TriggerPayload} from "@memebox/contracts";

interface HasUserName {
  username: string;
}

interface TypedTriggerPayload<TType extends AllTwitchTriggerConfigTypes> extends TriggerPayload {
  type: TType;
  values: TriggerPayload['values']
}

interface TwitchChatMessageTrigger extends TypedTriggerPayload<'twitch.message'> {
  values: TriggerPayload['values'] & HasUserName & {
    message: string;
  }
}

interface TwitchCheerTrigger extends TypedTriggerPayload<'twitch.cheer'> {
  values: TriggerPayload['values'] & HasUserName & {
    bits: number;
    message: string;
  }
}

interface TwitchRaidTrigger extends TypedTriggerPayload<'twitch.raid'> {
  values: TriggerPayload['values'] & HasUserName & {
    viewers: number;
  }
}

interface TwitchBanTrigger extends TypedTriggerPayload<'twitch.ban'> {
  values: TriggerPayload['values'] & HasUserName & {
    reason: string;
  }
}

interface TwitchSubTrigger extends TypedTriggerPayload<'twitch.sub'> {
  values: TriggerPayload['values'] & HasUserName & {
    subtype: 'anongiftpaidupgrade' | 'giftpaidupgrade' | 'resub' | 'subscription',

    months: number,
    message: string,
    cumulativeMonths: number,
    methods?: SubMethods,
  }
}


interface TwitchGiftSubTrigger extends TypedTriggerPayload<'twitch.giftsub'> {
  values: TriggerPayload['values'] & HasUserName & {
    subtype: 'subgift' | 'submysterygift',
    methods?: SubMethods,

    gifts: number,
    totalGifts: number,
    recipientId: number,
    recipientUserName: string,
    recipientDisplayName: string,
  }
}


interface TwitchChannelPointTrigger extends TypedTriggerPayload<'twitch.channelpoint'> {
  values: TriggerPayload['values'] & HasUserName & {
    redemptionDate: Date,
    rewardId: string,
    rewardName: string,
    rewardCost: number,
    message: string
  }
}



export type AllTwitchTriggers = TwitchChatMessageTrigger | TwitchCheerTrigger
  | TwitchRaidTrigger | TwitchBanTrigger | TwitchSubTrigger | TwitchGiftSubTrigger
  | TwitchChannelPointTrigger;

export interface TwitchTriggerCommand {
  config: TypedTwitchTriggerConfigs;
  tags?: ChatUserstate;
  payload?: AllTwitchTriggers;
}
