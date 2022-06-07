import {Pipe, PipeTransform} from "@angular/core";
import {Screen} from "@memebox/contracts";

@Pipe({
  name: 'clipsInScreenAmount',
  pure: true
})
export class ClipsInScreenAmountPipe implements PipeTransform {

  transform(value: Screen): number {
    return Object.values(value.clips).length;
  }
}
