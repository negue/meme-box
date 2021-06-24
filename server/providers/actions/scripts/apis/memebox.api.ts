import {Service} from "@tsed/di";
import {ActionTriggerEventBus} from "../../action-trigger-event.bus";
import {TriggerClipOrigin} from "@memebox/contracts";
import {ActionActiveState} from "../../action-active-state";

export class ActionApi {
  constructor(
    private memeboxApi: MemeboxApi,
    private actionId: string
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
  triggerWithOverrides(overrides: unknown): Promise<void> {
    this.memeboxApi.actionTriggerEventBus.triggerMedia({
      id: this.actionId,
      origin: TriggerClipOrigin.Scripts,
      originId: this.memeboxApi.scriptId
    })

    return this.memeboxApi.actionActiveState.waitUntilDoneAsync(this.actionId);
  }
}

export class MediaApi extends ActionApi {
  updateScreenOptions(screenOptionsPayload: unknown): Promise<void> {
    return Promise.resolve();
  }
  triggerAndDoStuff(executionFunction: (currentVisibleMedia: unknown) => Promise<void>) {
    return Promise.resolve();
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
