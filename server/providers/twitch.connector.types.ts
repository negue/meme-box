import {ChatUserstate} from "tmi.js";
import {TwitchEventTypes} from "@memebox/contracts";

export interface TwitchEvent {
  type: TwitchEventTypes;
}

export class TwitchChatMessage implements TwitchEvent {
  type = TwitchEventTypes.message;

  constructor(public payload: {
                channel: string,
                userstate: ChatUserstate,  // todo remove to own types?
                message: string,
                self?: boolean // need self?!
              }
  ) {
  }
}

export class TwitchCheerMessage implements TwitchEvent {
  type: TwitchEventTypes.bits;

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
}


export class TwitchRaidedEvent implements TwitchEvent {
  type: TwitchEventTypes.raid;

  constructor(public payload: {
                channel: string, username: string, viewers: number
              }
  ) {
  }
}
