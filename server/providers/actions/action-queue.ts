import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";
import {ActionStateEnum, TriggerAction, VisibilityEnum} from "@memebox/contracts";
import {Subject} from "rxjs";
import {concatMap, filter, take} from "rxjs/operators";
import {ActionActiveState} from "./action-active-state";
import {isVisibleMedia} from "@memebox/shared-state";

export class ActionQueue {
  private _queueSubjectsDictionary: Record<string, Subject<TriggerAction>> = {};
  private _queueDone$ = new Subject<string>();

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private actionState: ActionActiveState,
    private actionExecuter: (action: TriggerAction) => Promise<void>
  ) {

  }

  public async triggerAndWaitUntilDone(triggerAction: TriggerAction) {
    const fullState = this._persistence.fullState();

    const actionConfig = fullState.clips[triggerAction.id];

    if (actionConfig.queueName) {
      if (isVisibleMedia(actionConfig.type)) {
        const currentState = this.actionState.getActiveStateEntry(triggerAction.id, triggerAction.targetScreen);
        const mediaInScreenConfig = fullState.screen[triggerAction.targetScreen]?.clips[triggerAction.id];

        const visibilityOfOverrides =currentState?.currentOverrides?.screenMedia?.visibility;
        const visibilityOfMedia = mediaInScreenConfig?.visibility;

        const currentVisibilityConfig = visibilityOfOverrides ?? visibilityOfMedia;

        if (currentState?.state === ActionStateEnum.Active && currentVisibilityConfig === VisibilityEnum.Toggle) {
          await this.executeTriggerWithoutQueueAndWait(triggerAction);
          return;
        }
      }

      const subject = this.createOrGetQueueSubject(actionConfig.queueName);
      subject.next(triggerAction);

      await this._queueDone$.pipe(
        filter(uniqueDone => uniqueDone === triggerAction.uniqueId),
        take(1),
      ).toPromise();
    } else {
      // no queue needed, "just do it"

      await this.executeTriggerWithoutQueueAndWait(triggerAction);
    }
  }

  private createOrGetQueueSubject (queueName: string) {
    if (this._queueSubjectsDictionary[queueName]) {
      return this._queueSubjectsDictionary[queueName];
    } else{
      const subject = new Subject<TriggerAction>();

      this._queueSubjectsDictionary[queueName] = subject;

      subject.pipe(
        // tap(action => console.info(queueName + ': Before concatMap to wait until its done', action.uniqueId)),

        // Process each task, but do so consecutively
        concatMap(async triggerAction => {
          await this.executeTriggerWithoutQueueAndWait(triggerAction);
          return triggerAction;
        }),

        // tap(action => console.info(queueName + ': After concatMap', action.uniqueId))
      ).subscribe((actionDone) => {
        this._queueDone$.next(actionDone.uniqueId);
      })

      return subject;
    }
  }

  private async executeTriggerWithoutQueueAndWait(triggerAction: TriggerAction) {
    await this.actionExecuter(triggerAction);
    await this.actionState.waitUntilDoneAsync(triggerAction.id, triggerAction.targetScreen);
  }
}
