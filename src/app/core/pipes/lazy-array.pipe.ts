import {Pipe, PipeTransform} from '@angular/core';
import {Observable, of} from "rxjs";
import {lazyArray} from "@gewd/utils/rxjs";

@Pipe({
  name: 'lazyArray$'
})
export class LazyArrayPipe implements PipeTransform {

  transform<TItem>(values: TItem[], delayBetween: number, amountOfItems: number): Observable<TItem[]> {
    return of(values).pipe(
      lazyArray(delayBetween, amountOfItems)
    );
  }

}
