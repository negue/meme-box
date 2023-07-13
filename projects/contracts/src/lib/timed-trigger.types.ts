import {TriggerConfig} from "@memebox/contracts";

export interface TimerTriggerConfig extends TriggerConfig {
  type: 'timer.ms';

  argumentValues: {
    interval: number
  };
}
