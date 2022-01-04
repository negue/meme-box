import { pipe } from "rxjs";
import { scan } from "rxjs/operators";

export function takeLatestItems<T>(amount: number, defaultValue: T[] = []) {
  return pipe(
    scan((acc, val: T) => {
      acc.push(val);
      return acc.slice(-amount);
    }, defaultValue)
  )
}
