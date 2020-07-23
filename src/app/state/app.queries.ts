import {Injectable} from "@angular/core";
import {Query} from "@datorama/akita";
import {State} from "@memebox/contracts";
import {AppStore} from "./app.store";
import {AppService} from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class AppQueries extends Query<State> {
  state$ = this.select().pipe(

  );

  clipList$ = this.select(store => Object.values(store.clips));
  screensList$ = this.select(store => Object.values(store.screen));
  twitchEvent$ = this.select(store => Object.values(store.twitchEvents));

  clipMap$ = this.select(store => store.clips);
  screenMap$ = this.select(store => store.screen);

  constructor(protected store: AppStore,
              protected service: AppService) {
    super(store);
  }
}
