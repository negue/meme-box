import {Pipe, PipeTransform} from '@angular/core';
import {Action, ActionType} from "@memebox/contracts";

// TODO refactor all those per action type specific "stuff"

const TRIGGER_ACTIONS =  [
  ActionType.Script,
  ActionType.PermanentScript,
  ActionType.Recipe,
  ActionType.Audio,
];

@Pipe({
  name: 'actionPreviewLabel'
})
export class ActionPreviewLabelPipe implements PipeTransform {

  transform(value: Action): string {
    return TRIGGER_ACTIONS.includes(value.type)
      ? 'Trigger'
      : 'Preview';
  }

}

@Pipe({
  name: 'actionPreviewVariablesTooltip'
})
export class ActionPreviewVariablesTooltipPipe implements PipeTransform {

  transform(value: Action): string {
    return TRIGGER_ACTIONS.includes(value.type)
      ? 'Trigger with custom variables'
      : 'Preview with custom variables';
  }

}
