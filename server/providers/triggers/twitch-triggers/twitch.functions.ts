import {
  AllTwitchEvents,
  TwitchBanTriggerConfig,
  TwitchChannelPointTriggerConfig,
  TwitchCheerTriggerConfig,
  TwitchEventTypes,
  TwitchGiftSubscriptionTriggerConfig,
  TwitchMessageTriggerConfig,
  TwitchRaidTriggerConfig,
  TwitchSubscriptionTriggerConfig,
  TwitchTriggerCommand,
  TypedTwitchTriggerConfigs
} from "@memebox/contracts";
import * as tmi from "tmi.js";
import {CommonUserstate} from "tmi.js";

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

export function* getCommandsOfTwitchEvent(
  twitchSettingsList: TypedTwitchTriggerConfigs[],
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

    }
      break;
    case TwitchEventTypes.bits: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent,
        (currentTriggerConfig, event) => {
          if (currentTriggerConfig.type !== "twitch.cheer") {
            return false;
          }

          return checkEventInRange(event.payload.bits,
            currentTriggerConfig.argumentValues.min_bits,
            currentTriggerConfig.argumentValues.max_bits
          );
        }
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
          currentTriggerConfig.type === "twitch.raid" &&
          checkEventInRange(event.payload.viewers,
            currentTriggerConfig.argumentValues.min_viewer,
            currentTriggerConfig.argumentValues.max_viewer)
      );

      break;
    }
    case TwitchEventTypes.channelPoints: {
      yield* returnAllCommandsByType(
        onlyActiveConfigs,
        twitchEvent,
        (currentTriggerConfig, event) =>
          currentTriggerConfig.type === "twitch.channelpoint"
          && event.payload.rewardId === currentTriggerConfig.argumentValues.channelPointId
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

    }
      break;

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

function checkEventInRange(amount: number, minAmount?: number, maxAmount?: number) {
  minAmount ??= 0;
  maxAmount ??= Infinity;

  return amount >= minAmount && amount <= maxAmount;
}

type TriggerEventsToTriggerConfigs = {
  [TwitchEventTypes.message]: TwitchMessageTriggerConfig,
  [TwitchEventTypes.ban]: TwitchBanTriggerConfig,
  [TwitchEventTypes.gift]: TwitchGiftSubscriptionTriggerConfig,
  [TwitchEventTypes.raid]: TwitchRaidTriggerConfig,
  [TwitchEventTypes.bits]: TwitchCheerTriggerConfig,
  [TwitchEventTypes.subscription]: TwitchSubscriptionTriggerConfig,
  [TwitchEventTypes.channelPoints]: TwitchChannelPointTriggerConfig,
}

function* returnAllCommandsByType<TTwitchEvent extends AllTwitchEvents>(
  twitchSettingsList: TypedTwitchTriggerConfigs[],
  twitchEvent: TTwitchEvent,
  condition: (currentTriggerConfig: TypedTwitchTriggerConfigs, event: TTwitchEvent) => boolean = () => true
): IterableIterator<TwitchTriggerCommand> {
  for (const twitchSetting of twitchSettingsList) {
    if (condition(twitchSetting, twitchEvent)) {
      yield {
        config: twitchSetting,
        twitchEvent
      };
    }
  }
}

function* returnAllCommandsByMessage(
  twitchSettingsList: TypedTwitchTriggerConfigs[],
  message: string,
  chatUserState: CommonUserstate,
  twitchEvent: AllTwitchEvents
): IterableIterator<TwitchTriggerCommand> {
  if (!message) {
    return;
  }

  let foundCommand: TwitchMessageTriggerConfig = null;

  const toLoweredMessage = message.toLowerCase();

  for (const twitchSetting of twitchSettingsList) {
    // check if the Twitch Event Config is triggered by "message"
    if (twitchSetting.type !== "twitch.message") {
      continue;
    }

    const {message, aliasList} = twitchSetting.argumentValues;

    // TODO improve multiple twitch commands with the same start name
    // TODO maybe with an order and "stop handling after this" ???
    const aliasesToCheck = [message, ...(aliasList ?? [])]
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

        if (foundCommand.argumentValues.message.length < message.length) {
          foundCommand = twitchSetting;
        }
      }
    }
  }

  if (foundCommand) {
    yield {
      config: foundCommand,
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
