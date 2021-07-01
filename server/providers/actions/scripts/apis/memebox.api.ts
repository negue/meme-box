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
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../../../contracts";
import {Persistence} from "../../../../persistence";
import merge from 'lodash/merge';


export class ActionApi {
  constructor(
    protected memeboxApi: MemeboxApi,
    protected actionId: string,
    protected screenId?: string | undefined
  ) {

  }

  async trigger(overrides?: TriggerActionOverrides | undefined): Promise<void> {
    // if there is one already running

    // todo add the current visibility it was trigggered with
    // - to prevent waiting if its currently in toggle mode

    // await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);

    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      overrides
    });

    await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);
  }
}

export class MediaApi extends ActionApi {
  constructor(
    memeboxApi: MemeboxApi,
    actionId: string,
    screenId?: string|undefined
  ) {
    super(memeboxApi, actionId, screenId);
  }

  updateScreenOptions(overrides: ScreenMediaOverridableProperies): Promise<void> {
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
    }
  ) => Promise<void>, overrides?: TriggerActionOverrides | undefined) {
    // if there is one already running
    await this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId, this.screenId);

    const newOverrides = merge({}, overrides, {
        screenMedia: {
          visibility: VisibilityEnum.Toggle
        }
      });

    console.info( { newOverrides });

    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId,
      targetScreen: this.screenId,
      overrides: newOverrides,
      useOverridesAsBase: true
    })

    await executionFunction({
      reset: () => this.updateScreenOptions(null)
    });

    await this.trigger(null);
  }
}

// todo multiple actions

export type ActionSelector = string  | {
  byId?: string[],
  byTags: string[]
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

  getMedia(mediaid: string, screenId?: string): MediaApi {
    return new MediaApi(this, mediaid, screenId);
  }
}

@Service()
export class MemeboxApiFactory {
  constructor(
    private actionTriggerEventBus: ActionTriggerEventBus,
    private actionActiveState: ActionActiveState,

    @Inject(PERSISTENCE_DI)
    private _persistence: Persistence
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
