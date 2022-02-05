import {Pipe, PipeTransform} from "@angular/core";

export type TypeGuard<A, B extends A> = (a: A) => a is B;

@Pipe({
  name: 'guardType'
})
export class GuardTypePipe implements PipeTransform {

  transform<A, B extends A>(value: A, typeGuard: TypeGuard<A, B>): B | undefined {
    return typeGuard(value) ? value : undefined;
  }

}
