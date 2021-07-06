import {Subject} from "rxjs";

export interface CanDispose {
  dispose(): void;
}

export abstract class DisposableBase implements CanDispose {
  protected _destroy$ = new Subject();

  dispose(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
