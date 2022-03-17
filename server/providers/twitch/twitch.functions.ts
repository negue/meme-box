import {AllTwitchEvents, TwitchEventTypes, TwitchTrigger, TwitchTriggerCommand} from "@memebox/contracts";
import * as tmi from "tmi.js";
import {CommonUserstate} from "tmi.js";

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

export function* getCommandsOfTwitchEvent(
  twitchSettingsList: TwitchTrigger[],
  twitchEvent: AllTwitchEvents
): IterableIterator<TwitchTriggerCommand> {
  const onlyActiveConfigs = twitchSettingsList.filter(s => s.active);

  switch (twitchEvent.type) {
    case TwitchEventTypes.message: {
      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.payload.message,
        twitchEvent.payload.userstate,
        twitchEvent
      );

    } break;
    case TwitchEventTypes.bits: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent,
        (currentTriggerConfig, event) =>
          checkEventInRange(event.payload.bits, currentTriggerConfig)
      );

      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.payload.message,
        twitchEvent.payload.userstate,
        twitchEvent
      );

      break;
    }
    case TwitchEventTypes.raid: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent,
        (currentTriggerConfig, event) =>
          checkEventInRange(event.payload.viewers, currentTriggerConfig)
      );

      break;
    }
    case TwitchEventTypes.channelPoints: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent,
        (currentTriggerConfig, event) => event.payload.rewardId === currentTriggerConfig.channelPointId
      );

      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.payload.message,
        null,
        twitchEvent
      );

      break;
    }

    case TwitchEventTypes.subscription: {
      yield* returnAllCommandsByMessage(
        onlyActiveConfigs,
        twitchEvent.payload.message,
        twitchEvent.payload.userState,
        twitchEvent
      );

      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent
      );

    } break;

    // otherwise the default will be called
    default: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent
      );

      break;
    }
  }
}

function checkEventInRange(amount: number, twitchSetting: TwitchTrigger) {
  const minAmount = twitchSetting.minAmount || 0;
  const maxAmount = twitchSetting.maxAmount || Infinity;

  return amount >= minAmount && amount <= maxAmount;
}

function* returnAllCommandsByType<TTwitchEvent extends AllTwitchEvents> (
  twitchSettingsList: TwitchTrigger[],
  twitchEvent: TTwitchEvent,
  condition: (currentTriggerConfig: TwitchTrigger, event: TTwitchEvent) => boolean = () => true
) : IterableIterator<TwitchTriggerCommand> {
  for (const twitchSetting of twitchSettingsList) {
    if (twitchEvent.type === twitchSetting.event && condition(twitchSetting, twitchEvent)) {
      yield {
        command: twitchSetting,
        twitchEvent
      };
    }
  }
}

function* returnAllCommandsByMessage (
  twitchSettingsList: TwitchTrigger[],
  message: string,
  chatUserState: CommonUserstate,
  twitchEvent: AllTwitchEvents
) : IterableIterator<TwitchTriggerCommand> {
  if (!message) {
    return;
  }

  let foundCommand: TwitchTrigger = null;

  const toLoweredMessage = message.toLowerCase();

  for (const twitchSetting of twitchSettingsList) {
    // check if the Twitch Event Config is triggered by "message"
    if (twitchSetting.event !== TwitchEventTypes.message) {
      continue;
    }

    // TODO improve multiple twitch commands with the same start name
    // TODO maybe with an order and "stop handling after this" ???
    const aliasesToCheck = [twitchSetting.contains, ...(twitchSetting.aliases ?? [])]
      .map(a => a.toLowerCase());

    const foundAnyCommandsInMessage = aliasesToCheck.some(alias => toLoweredMessage.includes(alias));

    if (foundAnyCommandsInMessage) {
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
      tags: chatUserState,
      twitchEvent
    };
  }
}

export function getLevelOfTags(userState: tmi.Userstate): string[] {
  const levels = ['user'];

  if (!userState?.badges) {
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
