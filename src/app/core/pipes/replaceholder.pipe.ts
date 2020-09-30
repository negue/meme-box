import {Pipe, PipeTransform} from '@angular/core';
import {SERVER_URL} from "@memebox/contracts";
import {EXPRESS_BASE} from "../../state/app.service";

@Pipe({
  name: 'replaceholder'
})
export class ReplaceholderPipe implements PipeTransform {

  transform(value: string): string {
    return replaceholder(value);
  }

}

export function replaceholder (value: string): string{
  if (value) {
    return value.replace(SERVER_URL, EXPRESS_BASE);
  }

  return '';
}
