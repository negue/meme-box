import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'isUndefined'
})
export class IsUndefinedPipe implements PipeTransform {

  transform(value: unknown): unknown {
    return typeof value === 'undefined';
  }

}
