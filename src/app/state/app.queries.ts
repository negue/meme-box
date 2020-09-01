import {Injectable} from "@angular/core";
import {Query} from "@datorama/akita";
import {AppState} from "@memebox/contracts";
import {AppStore} from "./app.store";
import {AppService} from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class AppQueries extends Query<AppState> {
  state$ = this.select().pipe(

  );

  clipList$ = this.select(store => Object.values(store.clips));
  screensList$ = this.select(store => Object.values(store.screen));
  twitchEvent$ = this.select(store => Object.values(store.twitchEvents));
  tagList$ = this.select(store => Object.values(store.tags));


  clipMap$ = this.select(store => store.clips);
  screenMap$ = this.select(store => store.screen);
  config$ = this.select(store => store.config);
  currentMediaFile$ = this.select(store => store.currentMediaFiles);
  inOfflineMode$ = this.select(store => store.offlineMode);

  constructor(protected store: AppStore,
              protected service: AppService) {
    super(store);
  }
}
