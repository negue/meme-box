import {Dictionary, TriggerClipOrigin} from "@memebox/contracts";
import {PersistenceInstance} from "./persistence";
import {triggerMediaClipById} from "./websocket-server";
import Timeout = NodeJS.Timeout;

export class TimedHandler {
  private intervalDictionary: Dictionary<Timeout> = {};

  startTimers () {
    var timedClips = PersistenceInstance.listTimedEvents();

    for (const timer of timedClips) {
      if (timer.active) {
        this.intervalDictionary[timer.id] = setInterval(() => {
          triggerMediaClipById({
            id: timer.clipId,
            targetScreen: timer.screenId,
            origin: TriggerClipOrigin.Timer,
            originId: timer.id
          });
        }, timer.everyXms);
      }
    }

  }

  refreshTimers () {
    // easiest way
    this.stopTimers();
    this.startTimers();

    // todo more fine-tuned approach, only reset the changed timers
  }

  stopTimers () {
    const allTimeouts = Object.values(this.intervalDictionary);

    for (const timeout of allTimeouts) {
      clearInterval(timeout);
    }
  }
}
