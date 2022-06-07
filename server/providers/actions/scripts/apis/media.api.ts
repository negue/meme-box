import { ActionApi } from "./action.api";
import {
  ScreenMediaOverridableProperties,
  TriggerActionOrigin,
  TriggerActionOverrides,
  VisibilityEnum
} from "@memebox/contracts";
import { timeoutAsync } from "./sleep.api";
import merge from "lodash/merge";
import { uuid } from "@gewd/utils";

export class MediaApi extends ActionApi {
  updateScreenOptions(overrides: ScreenMediaOverridableProperties, timeoutInMs = 50): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.updateActionProps({
      id: this.actionId,
      uniqueId: uuid(),
      origin: TriggerActionOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides: {
        screenMedia: overrides
      }
    })

    return timeoutAsync(timeoutInMs);
  }

  async triggerWhile(executionFunction: (
    helpers:
      {
        reset: () => void,
        resetAfterDone: (delayAfterTriggered: number) => void,
      }
  ) => Promise<void>, overrides?: TriggerActionOverrides | undefined) {
    if (!this.screenId) {
      throw new Error("triggerWhile needs to know the target screen id");
    }

    // if there is one already running
    await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);

    const newOverrides = merge({}, overrides, {
      screenMedia: {
        visibility: VisibilityEnum.Toggle
      }
    });

    this.memeboxApi.actionTriggerEventBus.queueAction({
      id: this.actionId,
      uniqueId: uuid(),
      origin: TriggerActionOrigin.Scripts,
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
