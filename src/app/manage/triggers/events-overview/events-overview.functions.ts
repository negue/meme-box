import {
  TwitchBanEvent,
  TwitchChannelPointRedemptionEvent,
  TwitchChatMessage,
  TwitchCheerMessage,
  TwitchEvent,
  TwitchEventTypes,
  TwitchGiftEvent,
  TwitchRaidedEvent,
  TwitchSubEvent,
  TwitchTrigger
} from "@memebox/contracts";
import {Badges} from "tmi.js";

export function convertTwitchEventConfigToTwitchEvent (
  trigger: TwitchTrigger,
  badges: Badges
): TwitchEvent {
  switch (trigger.event) {
    case TwitchEventTypes.message: {
      return new TwitchChatMessage({
        channel: '',
        message: trigger.contains,
        self: false,
        userstate: {
          badges,
          username: 'memebox'
        }
      })
    }
    case TwitchEventTypes.bits: {
      return new TwitchCheerMessage({
        channel: '',
        message: 'Some Bit Message',
        userstate: {
          badges,
          username: 'memebox',
          bits: ''+ (trigger.minAmount || trigger.maxAmount || 133),
        }
      })
    }
    case TwitchEventTypes.raid: {
      return new TwitchRaidedEvent({
        channel: '',
        username: 'memebox',
        viewers: trigger.minAmount ?? trigger.maxAmount
      })
    }
    case TwitchEventTypes.ban: {
      return new TwitchBanEvent({
        username: 'memebox',
        reason: 'cause'
      })
    }
    case TwitchEventTypes.subscription: {
      return new TwitchSubEvent({
        message: 'New Sub',
        username: 'memebox',
        subtype: 'subscription',
        months: 13,
        cumulativeMonths: 13,
        shouldShareStreak: true,
        userState: {
          badges,
          username: 'memebox',
        }
      })
    }
    case TwitchEventTypes.gift: {
      return new TwitchGiftEvent({
        subtype: 'subgift',
        userState: {
          badges,
          username: 'memebox',
        },
        gifter: 'memebox',
        gifts: 3,
        totalGifts: 420,
        recipientId: 1337,
recipientDisplayName: 'memebox-fan',
recipientUserName: 'memebox-fan',
        streakMonths: 3, // some properties are .... weird
      })
    }
    case TwitchEventTypes.channelPoints: {
      return new TwitchChannelPointRedemptionEvent({
        userId: 'memebox',
        userName: 'memebox',
        rewardId: trigger.channelPointId,
        message: 'additional message?',
        redemptionDate: new Date(),
        userDisplayName: 'memebox',
        rewardName: 'Some Channelpoint',
        rewardCost: 1337
      })
    }
  }
}
