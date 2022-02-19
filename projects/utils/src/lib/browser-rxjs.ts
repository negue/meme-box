import { BehaviorSubject, Observable, pipe, Subject, Subscription, UnaryFunction } from "rxjs";
import { startWith, takeUntil, tap } from "rxjs/operators";

// TODO combine / clean up / extract to library

export function savedBehaviorSubject<TValue> (
  saveKey: string,
  subject$: BehaviorSubject<TValue>,
  destroy$: Subject<void>
) : Subscription {
  const savedValueString = localStorage.getItem(saveKey);
  const savedValue: TValue = savedValueString
    ? JSON.parse(savedValueString)
    : subject$.value;

  subject$.next(savedValue);

  return subject$.pipe(
    takeUntil(destroy$)
  ).subscribe(
    value => {
      localStorage.setItem(saveKey, JSON.stringify(value))
    }
  );
}


export function cacheSessionStorage<TInput, TResult = TInput>(
  sessionStorageKey: string,
  defaultValue: TResult,
  customPipes?: (loadedValues: TResult) => UnaryFunction<Observable<TInput>, Observable<TResult>>
): UnaryFunction<Observable<TInput>, Observable<TResult>> {
  const currentSavedData = sessionStorage.getItem(sessionStorageKey);
  const currentObject: TResult = currentSavedData
    ? JSON.parse(currentSavedData)
    : defaultValue;

  if (customPipes) {
    return pipe(
      customPipes(currentObject),
      startWith(currentObject),
      tap(newestValue => sessionStorage.setItem(sessionStorageKey, JSON.stringify(newestValue)))
    );
  }

  return pipe(
    startWith(currentObject),
    tap(newestValue => sessionStorage.setItem(sessionStorageKey, JSON.stringify(newestValue)))
  ) as any;  // some pipe internal typing which should work - but typescript says no.
}
