import {createRecipeContext, generateRecipeEntryCommandCall} from "@memebox/recipe-core";
import {StateV0, TimerActionV0, TwitchTriggerV0} from "projects/contracts/src/lib/types.outdated";
import {
  TimerTriggerConfig,
  TwitchBanTriggerConfig,
  TwitchChannelPointTriggerConfig,
  TwitchCheerTriggerConfig,
  TwitchEventTypes,
  TwitchGiftSubscriptionTriggerConfig,
  TwitchMessageTriggerConfig,
  TwitchRaidTriggerConfig,
  TwitchSubscriptionTriggerConfig
} from "@memebox/contracts";
import {LOGGER} from "../logger.utils";


export function convertToNewTriggerSystem(configFromFile: StateV0) {
  configFromFile.triggers ??= {};

  const twitchTriggersKeyValueList = Object.entries<TwitchTriggerV0>(configFromFile.twitchEvents as any);

  LOGGER.info("Starting Migration of Twitch Triggers");

  for (const [twitchTriggerId, twitchTriggerConfig] of twitchTriggersKeyValueList) {
    const oldTwitchTriggerConfig = configFromFile.twitchEvents[twitchTriggerId];

    // create a new recipe context for each trigger
    const recipe = createRecipeContext();
    const targetCommandBlocks = recipe.entries[recipe.rootEntry].subCommandBlocks[0].entries;

    const newCommandBlock = generateRecipeEntryCommandCall("triggerAction",{
      action: {
        actionId: oldTwitchTriggerConfig.clipId
      }
    });

    targetCommandBlocks.push(newCommandBlock.id);
    recipe.entries[newCommandBlock.id] = newCommandBlock;

    switch (oldTwitchTriggerConfig.event){
      case TwitchEventTypes.message: {
        if (!oldTwitchTriggerConfig.contains) {
          continue;
        }

        const label = oldTwitchTriggerConfig.name || oldTwitchTriggerConfig.contains;

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchMessageTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.message",
          id: twitchTriggerConfig.id,
          argumentValues: {
            message: oldTwitchTriggerConfig.contains,
            aliasList: oldTwitchTriggerConfig.aliases ?? [],
            twitchRoles: oldTwitchTriggerConfig.roles,
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.bits: {
        const label = oldTwitchTriggerConfig.name;

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchCheerTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.cheer",
          id: twitchTriggerConfig.id,
          argumentValues: {
            min_bits: oldTwitchTriggerConfig.minAmount,
            max_bits: oldTwitchTriggerConfig.maxAmount,

            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.ban: {
        const label = oldTwitchTriggerConfig.name;

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchBanTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.ban",
          id: twitchTriggerConfig.id,
          argumentValues: {
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.raid: {
        const label = oldTwitchTriggerConfig.name || "Raid";

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchRaidTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.raid",
          id: twitchTriggerConfig.id,
          argumentValues: {
            max_viewer: oldTwitchTriggerConfig.maxAmount,
            min_viewer: oldTwitchTriggerConfig.minAmount,
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.subscription: {
        const label = oldTwitchTriggerConfig.name;

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchSubscriptionTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.sub",
          id: twitchTriggerConfig.id,
          argumentValues: {
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.gift: {

        const label = oldTwitchTriggerConfig.name;

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchGiftSubscriptionTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label,
          type: "twitch.giftsub",
          id: twitchTriggerConfig.id,
          argumentValues: {
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
      case TwitchEventTypes.channelPoints: {
        const label = `Channel Points: ${oldTwitchTriggerConfig.channelPointData?.title}`

        LOGGER.info(`Migrating Twitch Trigger:  ${label}`);

        const twitchMessageTriggerConfig: TwitchChannelPointTriggerConfig = {
          active: oldTwitchTriggerConfig.active,
          label: label,
          type: "twitch.channelpoint",
          id: twitchTriggerConfig.id,
          argumentValues: {
            channelPointId: oldTwitchTriggerConfig.channelPointId,
            cooldown: oldTwitchTriggerConfig.cooldown,
            ignoreBroadcasterCooldown: oldTwitchTriggerConfig.canBroadcasterIgnoreCooldown ?? false
          },
          channelPointData: oldTwitchTriggerConfig.channelPointData,
          recipe,
        };

        configFromFile.triggers[twitchMessageTriggerConfig.id] = twitchMessageTriggerConfig;
        break;
      }
    }
  }

  const timerTriggersKeyValueList = Object.entries<TimerActionV0>(configFromFile.timers as any);

  LOGGER.info("Starting Migration of Timed Triggers");

  for (const [timerTriggerId, timerTrigger] of timerTriggersKeyValueList) {
    const timedTriggerName = `Timers ${timerTrigger.everyXms}ms`;

    LOGGER.info(`Migrating Timed Trigger:  ${timedTriggerName}`);

    // create a new recipe context for each trigger
    const recipe = createRecipeContext();
    const targetCommandBlocks = recipe.entries[recipe.rootEntry].subCommandBlocks[0].entries;

    const newCommandBlock = generateRecipeEntryCommandCall("triggerAction",{
      action: {
        actionId: timerTrigger.clipId
      }
    });

    targetCommandBlocks.push(newCommandBlock.id);
    recipe.entries[newCommandBlock.id] = newCommandBlock;

    const timerTriggerConfig: TimerTriggerConfig = {
      active: timerTrigger.active,
      label: timedTriggerName,
      type: "timer.ms",
      id: timerTrigger.id,
      argumentValues: {
        interval: timerTrigger.everyXms,
      },
      recipe,
    };

    configFromFile.triggers[timerTriggerConfig.id] = timerTriggerConfig;

    delete configFromFile.twitchEvents;
    delete configFromFile.timers;
  }
}
