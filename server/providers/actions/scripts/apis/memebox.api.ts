import {Service} from "@tsed/di";
import {ActionTriggerEventBus} from "../../action-trigger-event.bus";
import {MediaType} from "@memebox/contracts";
import {ActionActiveState} from "../../action-active-state";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../../../contracts";
import {Persistence} from "../../../../persistence";
import {DisposableBase} from "./disposableBase";
import {takeUntil} from "rxjs/operators";
import {ActionApi} from "./action.api";
import {MediaApi} from "./media.api";


// todo multiple actions

export type ActionSelector = string  | {
  byId?: string[],
  byTags: string[]
}

export class MemeboxApi extends DisposableBase {

  // for permanent scripts
  public onAction$ = this.actionTriggerEventBus.AllTriggerEvents$.pipe(
    takeUntil(this._destroy$)
  );

  constructor(
    public actionTriggerEventBus: ActionTriggerEventBus,
    public actionActiveState: ActionActiveState,
    public scriptId: string,
    public scriptType: MediaType
  ) {
    super();

    // Only Permanent Scripts as allowed to subscribe to Events
    if (scriptType === MediaType.Script) {
      this._destroy$.next();
    }
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

  getApiFor(scriptId: string, scriptType: MediaType): MemeboxApi {
    return new MemeboxApi(
      this.actionTriggerEventBus,
      this.actionActiveState,
      scriptId,
      scriptType
    );
  }
}
