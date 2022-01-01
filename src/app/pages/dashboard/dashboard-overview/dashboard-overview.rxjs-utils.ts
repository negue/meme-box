import {Observable, pipe, UnaryFunction} from "rxjs";
import {scan, startWith, tap} from "rxjs/operators";

export function takeLatestItems<T>(amount: number, defaultValue: T[] = []) {
  return pipe(
    scan((acc, val: T) => {
      acc.push(val);
      return acc.slice(-amount);
    }, defaultValue)
  )
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

      tap(data => console.info('Data after StartWith', data)),
      customPipes(currentObject),


      tap(data => console.info('Data after customPipes', data)),

      startWith(currentObject),
      tap(newestValue => sessionStorage.setItem(sessionStorageKey, JSON.stringify(newestValue)))
    );
  }

  return pipe(
    startWith(currentObject as TResult),
    tap(newestValue => sessionStorage.setItem(sessionStorageKey, JSON.stringify(newestValue)))
  ) as any;  // some pipe internal typing which should work - but typescript says no.
}
