import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'showOnlyLastCharacters'
})
export class ShowOnlyLastCharactersPipe implements PipeTransform {

  transform(value: string, lengthOfCharacters: number): string {
    if (!value) {
      return '';
    }


    if (value.length <= lengthOfCharacters) {
      return value;
    }

    const lengthOfCharactersToCutOff = lengthOfCharacters - 3;

    return '...' + value.substring(value.length - lengthOfCharactersToCutOff);
  }

}
