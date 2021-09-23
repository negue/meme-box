import {Store, StoreConfig} from '@datorama/akita';
import {Injectable} from "@angular/core";
import {produce} from 'immer';
import {ActionStateEntries} from "@memebox/shared-state"; // the best state helper!!

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'action-activity', producerFn: produce})
export class ActivityStore extends Store<ActionStateEntries> {
  constructor() {
    super({});
  }
}
