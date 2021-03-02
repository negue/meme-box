import {Pipe, PipeTransform} from '@angular/core';
import {PositionEnum} from "@memebox/contracts";

@Pipe({
  name: 'positionToString'
})
export class PositionToStringPipe implements PipeTransform {

  transform(value: PositionEnum): string {
    switch (value) {
      case PositionEnum.Absolute:
        return 'Fixed';
      case PositionEnum.Random:
        return 'Random';
      case PositionEnum.Centered:
        return 'Centered';
      case PositionEnum.FullScreen:
        return 'Full Screen';
    }
  }

}
