
// https://github.com/angular/angular/issues/34522#issuecomment-762973301
// todo try to recreate ngSwitchCase but with type guards

import {Pipe, PipeTransform} from "@angular/core";
import {
  AllTwitchEvents,
  TwitchBanEvent,
  TwitchChannelPointRedemptionEvent,
  TwitchCheerMessage,
  TwitchGiftEvent,
  TwitchRaidedEvent,
  TwitchSubEvent
} from "../../../../../server/providers/twitch/twitch.connector.types";

export type TypeGuard<A, B extends A> = (a: A) => a is B;

@Pipe({
  name: 'guardType'
})
export class GuardTypePipe implements PipeTransform {

  transform<A, B extends A>(value: A, typeGuard: TypeGuard<A, B>): B | undefined {
    return typeGuard(value) ? value : undefined;
  }

}

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
