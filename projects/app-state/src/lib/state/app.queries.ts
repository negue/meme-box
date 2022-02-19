import {Injectable} from "@angular/core";
import {Query} from "@datorama/akita";
import {AppState} from "@memebox/contracts";
import {AppStore} from "./app.store";

@Injectable({
  providedIn: "root"
})
export class AppQueries extends Query<AppState> {
  state$ = this.select().pipe(

  );

  actionList$ = this.select(store => Object.values(store.clips));
  screensList$ = this.select(store => Object.values(store.screen));
  twitchEvents$ = this.select(store => Object.values(store.twitchEvents));
  timedEvents$ = this.select(store => Object.values(store.timers));
  tagList$ = this.select(store => Object.values(store.tags));
  queueList$ = this.select(store => {
    const allClips = Object.values(store.clips);

    const allQueueNames = allClips.map(c => c.queueName).filter(q => !!q);

    const onlyUnique = new Set(allQueueNames);

    return Array.from(onlyUnique);
  });


  actionMap$ = this.select(store => store.clips);
  tagMap$ = this.select(store => store.tags);
  screenMap$ = this.select(store => store.screen);
  config$ = this.select(store => store.config);
  version$ = this.select(store => store.version);
  update$ = this.select(store => store.update);
  currentMediaFile$ = this.select(store => store.currentMediaFiles);
  inOfflineMode$ = this.select(store => store.offlineMode);

  constructor(protected store: AppStore) {
    super(store);
  }
}
