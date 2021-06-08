import {ChatUserstate} from "tmi.js";
import {TwitchEventTypes} from "@memebox/contracts";

export interface TwitchEvent {
  type: TwitchEventTypes;
}

export interface TwitchEventHasMessage {
  message: string;
}

export class TwitchChatMessage implements TwitchEvent, TwitchEventHasMessage {

  readonly type = TwitchEventTypes.message;

  constructor(public payload: {
                channel: string,
                userstate: ChatUserstate,  // todo remove to own types?
                message: string,
                self?: boolean // need self?!
              }
  ) {
  }

  get message() {
    return this.payload.message;
  }
}

export class TwitchCheerMessage implements TwitchEvent, TwitchEventHasMessage {
  readonly type = TwitchEventTypes.bits;

  public payload: {
    channel: string,
    userstate: ChatUserstate,  // todo remove to own types?
    message: string,
    bits: number;
  }

  constructor(payload: {
                channel: string,
                userstate: ChatUserstate,  // todo remove to own types?
                message: string
              }
  ) {
    this.payload = {
      ...payload,
      bits: parseInt(payload.userstate.bits)
    }
  }

  get message() {
    return this.payload.message;
  }
}


export class TwitchRaidedEvent implements TwitchEvent {
  readonly type = TwitchEventTypes.raid;

  constructor(public payload: {
                channel: string, username: string, viewers: number
              }
  ) {
  }
}

export class TwitchChannelPointRedemptionEvent implements TwitchEvent {
  readonly type = TwitchEventTypes.channelPoints;

  constructor(public payload: {
    id: string,
    userId: string,
    userName: string,
    userDisplayName: string,
    redemptionDate: Date,
    rewardId: string,
    rewardName: string,
    rewardCost: number,
    message: string
  }) {
  }
}

export type AllTwitchEvents = TwitchChatMessage | TwitchCheerMessage
  | TwitchRaidedEvent | TwitchChannelPointRedemptionEvent;
