import {Service} from "@tsed/di";
import {ActionTriggerEventBus} from "../../action-trigger-event.bus";
import {
  ScreenMediaOverridableProperies,
  TriggerActionOverrides,
  TriggerClipOrigin,
  VisibilityEnum
} from "@memebox/contracts";
import {ActionActiveState} from "../../action-active-state";
import {timeoutAsync} from "./sleep.api";

export class ActionApi {
  constructor(
    protected memeboxApi: MemeboxApi,
    protected actionId: string
  ) {

  }


  trigger(): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId
    })

    return this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId);
  }

  triggerWithOverrides(overrides: TriggerActionOverrides): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      overrides
    })

    return this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId);
  }
}

export class MediaApi extends ActionApi {
  constructor(
    memeboxApi: MemeboxApi,
    actionId: string
  ) {
    super(memeboxApi, actionId);
  }

  updateScreenOptions(overrides: ScreenMediaOverridableProperies): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.updateMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      overrides: {
        screenMedia: overrides
      }
    })

    return timeoutAsync(50);
  }

  async triggerAndDoStuff(executionFunction: (
    helpers:
    {
      reset: () => void,
    }
  ) => Promise<void>) {
    // screenId needed?

    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      overrides: {
        screenMedia: {
          visibility: VisibilityEnum.Toggle
        }
      },
      useOverridesAsBase: true
    })

    await executionFunction({
      reset: () => this.updateScreenOptions(null)
    });

    await this.triggerWithOverrides(null);
  }
}

export class MemeboxApi {
  constructor(
    public actionTriggerEventBus: ActionTriggerEventBus,
    public actionActiveState: ActionActiveState,
    public scriptId: string
  ) {

  }


  getAction(actionId: string): ActionApi {
    return new ActionApi(this, actionId);
  }
  getMedia(mediaid: string): MediaApi {
    return new MediaApi(this, mediaid);
  }
}

@Service()
export class MemeboxApiFactory {
  constructor(
    private actionTriggerEventBus: ActionTriggerEventBus,
    private actionActiveState: ActionActiveState
  ) {
  }

  getApiFor(scriptId: string): MemeboxApi {
    return new MemeboxApi(
      this.actionTriggerEventBus,
      this.actionActiveState,
      scriptId
    );
  }
}
