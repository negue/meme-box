import {ChatUserstate, SubMethods, Userstate} from "tmi.js";
import {TwitchEventTypes} from "./types";

export interface TwitchEvent {
  type: TwitchEventTypes;
  timestamp: Date;
}

abstract class TwitchEventBase implements TwitchEvent {
  timestamp: Date = new Date();
  abstract type: TwitchEventTypes;
}

export class TwitchChatMessage
  extends TwitchEventBase
  implements TwitchEvent {

  readonly type = TwitchEventTypes.message;

  constructor(public payload: {
                channel: string,
                userstate: ChatUserstate,  // todo remove to own types?
                message: string,
                self?: boolean // need self?!
              }
  ) {
    super();
  }
}

export class TwitchCheerMessage
  extends TwitchEventBase
  implements TwitchEvent {
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
    super();
    this.payload = {
      ...payload,
      bits: parseInt(payload.userstate.bits)
    }
  }
}


export class TwitchRaidedEvent
  extends TwitchEventBase
  implements TwitchEvent {
  readonly type = TwitchEventTypes.raid;

  constructor(public payload: {
                channel: string, username: string, viewers: number
              }
  ) {
    super();
  }
}


export class TwitchBanEvent
  extends TwitchEventBase
  implements TwitchEvent {
  readonly type = TwitchEventTypes.ban;

  constructor(public payload: {
                username: string,
                reason: string
              }
  ) {
    super();
  }
}

export class TwitchSubEvent
  extends TwitchEventBase
  implements TwitchEvent {
  readonly type = TwitchEventTypes.subscription;

  constructor(public payload: {
                subtype: 'anongiftpaidupgrade' | 'giftpaidupgrade' | 'resub' | 'subscription',
                username: string,
                userState: Userstate,  // todo remove to own types?
                gifter?: string,
                months: number,
                message: string,
                cumulativeMonths: number,
                shouldShareStreak: boolean,
                methods?: SubMethods,
              }
  ) {
    super();
  }
}

export class TwitchGiftEvent
  extends TwitchEventBase
  implements TwitchEvent {
  readonly type = TwitchEventTypes.gift;

  constructor(public payload: {
                subtype: 'subgift' | 'submysterygift',
                gifter: string,
                streakMonths: number,
                userState: Userstate,  // todo remove to own types?

                methods?: SubMethods,
                gifts: number,
                totalGifts: number,
                recipientId: number,
                recipientUserName: string,
                recipientDisplayName: string,
              }
  ) {
    super();
  }
}

export class TwitchChannelPointRedemptionEvent
  extends TwitchEventBase
  implements TwitchEvent {
  readonly type = TwitchEventTypes.channelPoints;

  constructor(public payload: {
    userId: string,
    userName: string,
    userDisplayName: string,
    redemptionDate: Date,
    rewardId: string,
    rewardName: string,
    rewardCost: number,
    message: string
  }) {
    super();
  }
}

export type AllTwitchEvents = TwitchChatMessage | TwitchCheerMessage
  | TwitchRaidedEvent | TwitchBanEvent | TwitchSubEvent | TwitchGiftEvent
  | TwitchChannelPointRedemptionEvent;
