import {uuid} from "@gewd/utils";
import {ActionOverridableProperties, TriggerActionOverrides, TriggerClipOrigin} from "@memebox/contracts";
import {MemeboxApi} from "./memebox.api";
import {timeoutAsync} from "./sleep.api";

export class ActionApi {
  constructor(
    protected memeboxApi: MemeboxApi,
    public actionId: string,
    public screenId?: string | undefined
  ) {

  }

  async trigger(overrides?: TriggerActionOverrides | undefined): Promise<void> {
    // if there is one already running

    // todo add the current visibility it was trigggered with
    // - to prevent waiting if its currently in toggle mode

    // await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);

    this.memeboxApi.actionTriggerEventBus.queueAction({
      id: this.actionId,
      uniqueId: uuid(),
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides
    });

    await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);
  }


  updateVariables(overrides: ActionOverridableProperties, timeoutInMs = 50): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.updateActionProps({
      id: this.actionId,
      uniqueId: uuid(),
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides: {
        action: overrides,
      }
    })

    return timeoutAsync(timeoutInMs);
  }
}
