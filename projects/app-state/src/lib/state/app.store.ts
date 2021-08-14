import {Store, StoreConfig} from '@datorama/akita';
import {AppState, createInitialState} from "@memebox/contracts";
import {Injectable} from "@angular/core";
import {produce} from 'immer'; // the best state helper!!

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'state', producerFn: produce})
export class AppStore extends Store<AppState> {
  constructor() {
    super(createInitialState());
  }
}
