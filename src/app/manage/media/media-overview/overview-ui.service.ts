import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum OverviewUiMode {
  casual = 1,
  pro
}

@Injectable({
  providedIn: 'root'
})
export class OverviewUiService {
  private readonly _currentUiMode = new BehaviorSubject<OverviewUiMode>(OverviewUiMode.casual);

  public getCurrentUiMode$(): Observable<OverviewUiMode> {
    return this._currentUiMode;
  }

  public changeCurrentUiMode(newMode: OverviewUiMode): void  {
    if (newMode !== this._currentUiMode.getValue()) {
      this._currentUiMode.next(newMode);
    }
  }

  public toggleCurrentUiMode(): void  {
    const newMode = this._currentUiMode.getValue() === OverviewUiMode.casual
      ? OverviewUiMode.pro
      : OverviewUiMode.casual;

    this.changeCurrentUiMode(newMode);
  }
}
