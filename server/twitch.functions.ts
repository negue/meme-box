import {Twitch, TwitchEventTypes} from "@memebox/contracts";
import * as tmi from "tmi.js";

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

export function* getCommandsOfMessage(
  twitchSettingsList: Twitch[],
  message: string,
  event: TwitchEventTypes,
  eventOptions?: TwitchEventOptions
): IterableIterator<Twitch> {
  if (!message && !eventOptions) {
    return null;
  }

  let foundCommand: Twitch = null;
  for (const twitchSetting of twitchSettingsList) {
    if (!twitchSetting.active) {
      continue;
    }

    // raid / bits
    if (eventOptions && event === twitchSetting.event) {
      const minAmount = twitchSetting.minAmount || 0;
      const maxAmount = twitchSetting.maxAmount || Infinity;


      Object.keys(eventOptions).map((key) => {
        if(twitchSetting.response) {
          twitchSetting.response = twitchSetting.response.replace(`{{${key}}}`, eventOptions[key])
        }
      });

      if (eventOptions.amount && (eventOptions.amount >= minAmount && eventOptions.amount <= maxAmount)) {
        yield twitchSetting;
      }else if(eventOptions.amount && !(eventOptions.amount >= minAmount && eventOptions.amount <= maxAmount)){
        continue;
      }

      yield twitchSetting;
    }

    if (twitchSetting.event !== TwitchEventTypes.message) {
      continue;
    }

    // TODO improve multiple twitch commands with the same start name
    // TODO maybe with an order and "stop handling after this" ???
    if (message.toLowerCase().includes(twitchSetting.contains.toLowerCase())) {
      if (!foundCommand) {
        foundCommand = twitchSetting;
      } else {
        // another command, example
        //!party
        //!partyhard
        // always take the "longer" command

        if (foundCommand.contains.length < twitchSetting.contains.length) {
          foundCommand = twitchSetting;
        }
      }
    }
  }

  if (foundCommand) {
    yield foundCommand;
  }
}

interface TwitchEventOptions {
  amount?: number,
  username?: string,
  reason?: string
}

export function getLevelOfTags(userState: tmi.Userstate): string[] {
  const levels = ['user'];

  if (!userState.badges) {
    return levels;
  }

  if (userState.badges.broadcaster) {
    levels.push('broadcaster');
  }

  if (userState.badges.moderator) {
    levels.push('moderator');
  }

  if (userState.badges.founder) {
    levels.push('founder', 'subscriber');
  }

  if (userState.badges.subscriber) {
    levels.push('subscriber');
  }

  if (userState.badges.vip) {
    levels.push('vip');
  }

  return levels;
}
