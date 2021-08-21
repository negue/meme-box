import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {takeUntil} from "rxjs/operators";

export function savedBehaviorSubject<TValue> (
  saveKey: string,
  subject$: BehaviorSubject<TValue>,
  destroy$: Subject<void>
) : Subscription {
  const savedValueString = localStorage.getItem(saveKey);
  const savedValue: TValue = !!savedValueString
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
