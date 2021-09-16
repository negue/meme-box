import {ActionApi} from "./action.api";
import {
  ScreenMediaOverridableProperties,
  TriggerActionOverrides,
  TriggerClipOrigin,
  VisibilityEnum
} from "@memebox/contracts";
import {timeoutAsync} from "./sleep.api";
import merge from "lodash/merge";
import {MemeboxApi} from "./memebox.api";

export class MediaApi extends ActionApi {
  constructor(
    memeboxApi: MemeboxApi,
    actionId: string,
    screenId?: string | undefined
  ) {
    super(memeboxApi, actionId, screenId);
  }

  updateScreenOptions(overrides: ScreenMediaOverridableProperties): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.updateMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides: {
        screenMedia: overrides
      }
    })

    return timeoutAsync(50);
  }

  async triggerWhile(executionFunction: (
    helpers:
      {
        reset: () => void,
        resetAfterDone: (delayAfterTriggered: number) => void,
      }
  ) => Promise<void>, overrides?: TriggerActionOverrides | undefined) {
    // if there is one already running
    await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);

    const newOverrides = merge({}, overrides, {
      screenMedia: {
        visibility: VisibilityEnum.Toggle
      }
    });

    console.info({newOverrides});

    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides: newOverrides,
      useOverridesAsBase: true
    })

    let resetAfterDone = 0;

    await executionFunction({
      reset: () => this.updateScreenOptions(null),
      resetAfterDone: (delayAfterTriggered) => resetAfterDone = delayAfterTriggered
    });

    await this.trigger(null);

    if (resetAfterDone) {
      await timeoutAsync(resetAfterDone);

      this.updateScreenOptions(null)
    }
  }
}
