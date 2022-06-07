import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {debounceTime, skip} from "rxjs/operators";

export type ActionStore = Record<string, string|number|object|boolean>;

export interface ActionStoreAdapter {
  getCurrentData(mediaId: string): Promise<ActionStore>;
  updateData(mediaId: string, instanceId: string, newData: ActionStore);
}

export class ActionStoreApi {
  private _state: ActionStore = {};
  private _state$ = new BehaviorSubject<ActionStore>({});
  private _state$$: Subscription;
  private _loaded : Promise<boolean>;

  constructor(
    private mediaId: string,
    private instanceId: string,
    private _storeAdapter: ActionStoreAdapter,
    private _errorSubject$: Subject<string>
  ) {
    // todo extract / refactor to have only one store for all widgets on the browser / tab
    this._loaded = new Promise(async (resolve, reject) => {
      const stateResult = await _storeAdapter.getCurrentData(mediaId);

      this._state = stateResult;
      this._state$.next(stateResult);

      resolve(true);
    })

    // Load the Current State from API
    // MediaID
    this._state$$ = this._state$
      .pipe(
        skip(1),  // this is current state loaded once from API
        debounceTime(1500)
      )
      .subscribe(newStore => {
        this._storeAdapter.updateData(this.mediaId, this.instanceId, newStore);
      })
  }

  public ready() {
    return this._loaded;
  }

  public getString(key: string, defaultValue: string): string {
    const value = this._state[key];

    if (typeof value === 'string') {
      return value;
    }

    return defaultValue;
  }

  public setString(key: string, value: unknown): void  {
    if (typeof value !== 'string') {
      this._errorSubject$.next(`The "${key}" value needs to be a string`);
      return;
    }

    this._state[key] = value;

    this.updateObservable();
  }


  public getNumber(key: string, defaultValue: number): number {
    const value = this._state[key];

    if (typeof value === 'number') {
      return value;
    }

    return defaultValue;
  }

  public setNumber(key: string, value: unknown): void  {
    if (typeof value !== 'number') {
      this._errorSubject$.next(`The "${key}" value needs to be a number`);
      return;
    }

    this._state[key] = value;

    this.updateObservable();
  }

  public getObject(key: string, defaultValue: object): object {
    const value = this._state[key];

    if (typeof value === 'object') {
      return value ?? defaultValue;
    }

    return defaultValue;
  }

  public setObject(key: string, value: unknown): void  {
    if (typeof value !== 'object') {
      this._errorSubject$.next(`The "${key}" value needs to be an object`);
      return;
    }

    this._state[key] = value;

    this.updateObservable();
  }

  public getBool(key: string, defaultValue: boolean): boolean {
    const value = this._state[key];

    if (typeof value === 'boolean') {
      return value ?? defaultValue;
    }

    return defaultValue;
  }

  public setBool(key: string, value: unknown): void  {
    if (typeof value !== 'boolean') {
      this._errorSubject$.next(`The "${key}" value needs to be a boolean`);
      return;
    }

    this._state[key] = value;

    this.updateObservable();
  }

  dispose(): void  {
    this._state$$.unsubscribe();
  }

  public get state$ () {
    return this._state$.asObservable();
  }

  private updateObservable() {
    this._state$.next(this._state);
  }
}
