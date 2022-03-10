import {ChangeDetectorRef, OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {Observable, of, Subject} from "rxjs";
import {lazyArray} from "@gewd/utils/rxjs";
import {auditTime, takeUntil, tap} from "rxjs/operators";

@Pipe({
  name: 'lazyArray$'
})
export class LazyArrayPipe implements PipeTransform, OnDestroy {
  private _triggerRefresh = new Subject<void>();
  private _destroy$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef) {
    this._triggerRefresh.pipe(
      takeUntil(this._destroy$),
      auditTime(50)
    ).subscribe(() => {
      cd.detectChanges();
    });
  }

  transform<TItem>(values: TItem[], delayBetween: number, amountOfItems: number): Observable<TItem[]> {
    return of(values).pipe(
      lazyArray(delayBetween, amountOfItems),
      tap(() => this._triggerRefresh.next()),
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
