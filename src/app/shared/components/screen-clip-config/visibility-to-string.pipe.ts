import {Pipe, PipeTransform} from "@angular/core";
import {VisibilityEnum} from "@memebox/contracts";

@Pipe({
  name: 'visibilityToString'
})
export class VisibilityToStringPipe implements PipeTransform {

  transform(value: VisibilityEnum): string {
    switch (value) {
      case VisibilityEnum.Play:
        return 'Play';
      case VisibilityEnum.Static:
        return 'Always Visible';
      case VisibilityEnum.Toggle:
        return 'Toggle';
    }
  }

}
