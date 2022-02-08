import {
  AllTwitchEvents,
  TwitchBanEvent,
  TwitchChannelPointRedemptionEvent,
  TwitchCheerMessage,
  TwitchGiftEvent,
  TwitchRaidedEvent,
  TwitchSubEvent
} from "@memebox/contracts";
import {TypeGuard} from "../type-guard.pipe";


export const isChannelPointRedemption: TypeGuard<AllTwitchEvents, TwitchChannelPointRedemptionEvent> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchChannelPointRedemptionEvent => baseEvent.type === "channelPoints";

export const isCheer: TypeGuard<AllTwitchEvents, TwitchCheerMessage> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchCheerMessage => baseEvent.type === "bits";

export const isRaid: TypeGuard<AllTwitchEvents, TwitchRaidedEvent> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchRaidedEvent => baseEvent.type === 'raid';

export const isBan: TypeGuard<AllTwitchEvents, TwitchBanEvent> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchBanEvent => baseEvent.type === 'ban';

export const isSub: TypeGuard<AllTwitchEvents, TwitchSubEvent> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchSubEvent => baseEvent.type === 'subscription';

export const isGiftSub: TypeGuard<AllTwitchEvents, TwitchGiftEvent> = (
  baseEvent: AllTwitchEvents
): baseEvent is TwitchGiftEvent => baseEvent.type === 'gift';
