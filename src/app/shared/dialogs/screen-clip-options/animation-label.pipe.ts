import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'animationLabel'
})
export class AnimationLabelPipe implements PipeTransform {

  transform(value: string): string {
    const removedPrefix = value.replace('animate__', '');
    const toSentence = camelCaseToSentence(removedPrefix);

    return toSentence;
  }

}

function camelCaseToSentence (text: string) {
  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}
