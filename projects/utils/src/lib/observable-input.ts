// Code from https://github.com/pauldraper/neo-observable-input
// retry package once rxjs7 is added here

import {Observable, ReplaySubject, Subject} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";

class ObservableInput<T> {
  constructor(
    private readonly _subject: Subject<T>,
    private readonly _value: () => T
  ) {}

  onChanges() {
    this._subject.next(this._value());
  }
}

export class ObservableInputs {
  private readonly _inputs: ObservableInput<any>[] = [];

  onChanges(): void  {
    for (const input of this._inputs) {
      input.onChanges();
    }
  }

  observe<T>(value: () => T): Observable<T> {
    const subject = new ReplaySubject<T>(1);
    this._inputs.push(new ObservableInput(subject, value));
    return subject.pipe(distinctUntilChanged());
  }
}
