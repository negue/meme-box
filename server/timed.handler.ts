import {uuid} from "@gewd/utils";
import {Dictionary, TimedAction, TriggerActionOrigin} from "@memebox/contracts";
import {PersistenceInstance} from "./persistence";
import {triggerMediaClipById} from "./websocket-server";
import Timeout = NodeJS.Timeout;

// TODO refactor this to be a service inside TsED

export class TimedHandler {
  private intervalDictionary: Dictionary<Timeout> = {};

  startTimers(timerId?: string): void  {
    const timedClips = PersistenceInstance.listTimedEvents();

    if (timerId) {
      const foundTimer = timedClips.find(timer => timer.id === timerId)

      this.startTimerIfActive(foundTimer);

      return;
    }

    for (const timer of timedClips) {
      this.startTimerIfActive(timer);
    }
  }

  startTimerIfActive (timer: TimedAction): void  {
    if (!timer || !timer.active) {
      return;
    }

    this.intervalDictionary[timer.id] = setInterval(() => {
      triggerMediaClipById({
        id: timer.clipId,
        uniqueId: uuid(),
        targetScreen: timer.screenId,
        origin: TriggerActionOrigin.Timer,
        originId: timer.id,

        overrides: {
          action: {
            variables: timer.extended
          }
        }
      });
    }, timer.everyXms);
  }

  refreshTimers(timerId?: string): void  {
    // easiest way
    this.stopTimers(timerId);
    this.startTimers(timerId);

    // todo more fine-tuned approach, only reset the changed timers
  }

  stopTimers(timerId?: string): void  {
    if (timerId) {
      const timerInterval = this.intervalDictionary[timerId];
      clearInterval(timerInterval);

      return;
    }

    const allTimeouts = Object.values(this.intervalDictionary);

    for (const timeout of allTimeouts) {
      clearInterval(timeout);
    }
  }
}
