import {Store, StoreConfig} from '@datorama/akita';
import {Injectable} from "@angular/core";
import {produce} from 'immer';
import {ActivityState} from "./activity.types";

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'action-activity', producerFn: produce})
export class ActivityStore extends Store<ActivityState> {
  constructor() {
    super({
      actionState: {},
      screenState: {}
    });
  }
}
