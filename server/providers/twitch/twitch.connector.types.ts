import {ChatUserstate, SubMethods, Userstate} from "tmi.js";
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


export class TwitchBanEvent implements TwitchEvent {
  readonly type = TwitchEventTypes.ban;

  constructor(public payload: {
                username: string,
                reason: string
              }
  ) {
  }
}

export class TwitchSubEvent implements TwitchEvent {
  readonly type = TwitchEventTypes.subscription;

  constructor(public payload: {
    subtype: 'anongiftpaidupgrade'|'giftpaidupgrade'|'resub'|'subscription',
    username: string,
    userState: Userstate,  // todo remove to own types?
    gifter: string,
    months: number,
    message: string,
    cumulativeMonths: number,
    shouldShareStreak: boolean,
    methods: SubMethods,
              }
  ) {
  }
}

export class TwitchGiftEvent implements TwitchEvent {
  readonly type = TwitchEventTypes.subscription;

  constructor(public payload: {
                subtype: 'subgift' | 'submysterygift',
                gifter: string,
                streakMonths: number,
                userState: Userstate,  // todo remove to own types?

                methods: SubMethods,
                gifts: number,
                totalGifts: number,
                recipientId: number,
                recipientUserName: string,
                recipientDisplayName: string,
              }
  ) {
  }
}


export type AllTwitchEvents = TwitchChatMessage | TwitchCheerMessage
  | TwitchRaidedEvent | TwitchBanEvent | TwitchSubEvent | TwitchGiftEvent;
