import { BehaviorSubject } from "rxjs";
import { Service } from "@tsed/di";
import { uuid } from "@gewd/utils";

export interface RegisterServicePayload {
  name: string;
  color?: string;
}

export interface StatePayload {
  label: string;
  description?: string;
  backgroundColor?: string;
  color?: string;
}

interface StateOfAService extends RegisterServicePayload {
  state: StatePayload;
}

interface ConnectionState {
  [id: string]: StateOfAService
}

export type UpdateStateFunc = (state: StatePayload) => void;

@Service()
export class ConnectionsStateHub {
  private _currentState$ = new BehaviorSubject<ConnectionState>(
    {}
  );

  public currentState$() {
    return this._currentState$.asObservable();
  }

  public registerService(payload: RegisterServicePayload): UpdateStateFunc {
    const serviceId = uuid();

    this._currentState$.next({
      ...this._currentState$.value,
      [serviceId]: {
        ...payload,
        state: {
          label: 'State not updated yet'
        }
      }
    });

    return (state) => {
      const currentState = this._currentState$.value;

      currentState[serviceId].state = state;

      this._currentState$.next(currentState);
    }
  }
}
