import {Pipe, PipeTransform} from '@angular/core';
import {readableSeconds} from "./utils";

@Pipe({
  name: 'readableMs'
})
export class ReadableMsPipe implements PipeTransform {

  transform(value: string|number): string {
    if (typeof value === 'string') {
      value = +value;
    }

    return msToString(value);
  }

}

export function msToString (value: number): string  {
  if (!value) {
    return '';
  }

  const valueInSeconds = value / 1000;

  const readableResult = readableSeconds(valueInSeconds);

  return valueInSeconds >= 1 ? readableResult.string : `${value}ms`;
}
