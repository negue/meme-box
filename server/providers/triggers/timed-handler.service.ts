import {
  ActionType,
  Dictionary,
  TimerTriggerConfig,
  TriggerActionOrigin,
  TriggerTypeRegistration
} from "@memebox/contracts";
import {Persistence} from "../../persistence";
import {Service} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {debounceTime} from "rxjs/operators";
import {LOGGER} from "../../logger.utils";
import {ScriptHandler} from "../actions/scripts/script.handler";
import {uuid} from "@gewd/utils";
import Timeout = NodeJS.Timeout;


@Service()
export class TimedHandlerService {
  private intervalDictionary: Dictionary<Timeout> = {};

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private scriptHandler: ScriptHandler,
  ) {
    TriggerTypeRegistration.addTriggerGroup({
      key: 'timers',
      labels: {
        'en': 'Timers'
      },
      arguments: [
        {
          type: "number",
          name: 'interval',
          labels: {
            'en': 'Trigger'
          },
          suffix: 'every ms' // TODO make it like labels
        },
      ]
    });

    TriggerTypeRegistration.addTriggerType({
      type: 'timer.ms',
      groupKey: 'timers',
      labels: {
        'en': 'Timer Event'
      },
      arguments: [
      ]
    });

    _persistence.dataUpdated$()
      .pipe(
        debounceTime(600),
      )
      .subscribe((dataChanged) => {
        if (['everything', 'timers'].includes(dataChanged.dataType)) {
          this.refreshTimers(dataChanged.id);

          LOGGER.info(`Refreshing TimedHandler`);
        }
      });
  }

  startTimers(timerId?: string): void  {
    const timedClips = this._persistence.listTrigger(['timer.ms']);

    if (timerId) {
      const foundTimer = timedClips.find(timer => timer.id === timerId)

      this.startTimerIfActive(foundTimer as TimerTriggerConfig);

      return;
    }

    for (const timer of timedClips) {
      this.startTimerIfActive(timer as TimerTriggerConfig);
    }
  }

  startTimerIfActive (timer: TimerTriggerConfig): void  {
    if (!timer || !timer.active) {
      return;
    }

    this.intervalDictionary[timer.id] = setInterval(() => {
      this.scriptHandler.handleRecipe({
        name: timer.label,
        type: ActionType.Recipe,
        id: timer.id,
        recipe: timer.recipe
      }, {
        uniqueId: uuid(),
        origin: TriggerActionOrigin.Triggers,
        originId: timer.id,
        id: timer.id,
      });
    }, timer.argumentValues.interval);
  }

  refreshTimers(timerId?: string): void  {
    // easiest way
    this.stopTimers(timerId);
    this.startTimers(timerId);
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
