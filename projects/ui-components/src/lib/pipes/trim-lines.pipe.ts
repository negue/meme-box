import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'trimLines'
})
export class TrimLinesPipe implements PipeTransform {

  transform(value: string, maxLines: number): string {
    if (!value) {
      return '';
    }

    return value.split('\n').slice(0, maxLines -1).join('\n').trim();
  }

}
