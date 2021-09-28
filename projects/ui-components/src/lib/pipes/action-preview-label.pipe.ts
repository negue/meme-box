import {Pipe, PipeTransform} from '@angular/core';
import {Clip, MediaType} from "@memebox/contracts";

// TODO refactor all those per action type specific "stuff"

@Pipe({
  name: 'actionPreviewLabel'
})
export class ActionPreviewLabelPipe implements PipeTransform {

  transform(value: Clip): string {
    return [
      MediaType.Script,
      MediaType.PermanentScript,
      MediaType.Meta,
      MediaType.Audio,
    ].includes(value.type)
      ? 'Trigger'
      : 'Preview';
  }

}
