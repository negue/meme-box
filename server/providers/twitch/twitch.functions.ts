import {Twitch, TwitchEventTypes, TwitchTriggerCommand} from "@memebox/contracts";
import * as tmi from "tmi.js";
import {ChatUserstate} from "tmi.js";
import {AllTwitchEvents} from "./twitch.connector.types";

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

export function* getCommandsOfTwitchEvent(
  twitchSettingsList: Twitch[],
  twitchEvent: AllTwitchEvents
): IterableIterator<TwitchTriggerCommand> {
  const onlyActiveConfigs = twitchSettingsList.filter(s => s.active);

  switch (twitchEvent.type) {
    case TwitchEventTypes.message: {
      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.message,
        twitchEvent.payload.userstate
      );

    } break;
    case TwitchEventTypes.bits: {
      for (const twitchSetting of onlyActiveConfigs) {
        if (twitchEvent.type === twitchSetting.event
          && checkEventInRange(twitchEvent.payload.bits, twitchSetting)) {
          yield {
            command: twitchSetting,
            tags: twitchEvent.payload.userstate
          };
        }
      }

      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.message,
        twitchEvent.payload.userstate
      );

      break;
    }
    case TwitchEventTypes.raid: {
      for (const twitchSetting of onlyActiveConfigs) {
        if (twitchEvent.type === twitchSetting.event
          && checkEventInRange(twitchEvent.payload.viewers, twitchSetting)) {
          yield {
            command: twitchSetting,
          };
        }
      }

      break;
    }

  }
}

function checkEventInRange(amount: number, twitchSetting: Twitch) {
  const minAmount = twitchSetting.minAmount || 0;
  const maxAmount = twitchSetting.maxAmount || Infinity;

  return amount >= minAmount && amount <= maxAmount;
}

function* returnAllCommandsByMessage (
  twitchSettingsList: Twitch[],
  message: string,
  chatUserState: ChatUserstate,
) : IterableIterator<TwitchTriggerCommand> {

  let foundCommand: Twitch = null;
  for (const twitchSetting of twitchSettingsList) {
    // check if the Twitch Event Config is triggered by "message"
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
    yield {
      command: foundCommand,
      tags: chatUserState
    };
  }
}

interface TwitchEventOptions {
  amount: number
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
