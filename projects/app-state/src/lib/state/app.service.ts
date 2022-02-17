import {Injectable} from '@angular/core';
import {AppStore} from './app.store';
import {HttpClient} from '@angular/common/http';
import {
  Action,
  ChannelPointRedemption,
  ENDPOINTS,
  FileInfo,
  Response,
  Screen,
  ScreenClip,
  Tag,
  TimedAction,
  TwitchTrigger,
  UpdateState,
  VisibilityEnum
} from '@memebox/contracts';
import {API_PREFIX} from '../../../../../server/constants'; // TODO extract to shared library
import {AppConfig} from '@memebox/app/env';
import {addOrUpdateScreenClip, deleteAction, fillDefaultsScreenClip} from '@memebox/shared-state';
import {take} from 'rxjs/operators';
import {uuid} from "@gewd/utils";
import {BehaviorSubject, Observable} from "rxjs";
import {SnackbarService} from "../services/snackbar.service";

console.warn('APP.SERVICE.TS - AppConfig', AppConfig);

export const EXPRESS_BASE = AppConfig.expressBase;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;


// TODO split up service per module??



@Injectable()
export class AppService {
  private offlineMode$ = new BehaviorSubject<boolean>(true);

  constructor(private appStore: AppStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
              private snackbar: SnackbarService) {
  }

  public isOffline() {
    return this.offlineMode$.value;
  }

  public isOffline$() {
    return this.offlineMode$.asObservable();
  }

  public async loadState(): Promise<void> {
    this.appStore.setLoading(true);

    try {
      const httpResult = await  this.http.get(API_BASE).pipe(
        take(1)
        // delay(5000)
      ).toPromise();

      this.offlineMode$.next(false);
      
      this.appStore.update(state => httpResult);

      
      this.appStore.setLoading(false);
    } catch (error: any) {
      if (error.name === 'HttpErrorResponse') {
        this.appStore.update(state => {
          state.offlineMode = true;
        });
        this.offlineMode$.next(true);
        console.error('Changing into offline mode', error);
      }
    }
  }

  public listFiles() {
    this.http.get<FileInfo[]>(`${API_BASE}${ENDPOINTS.FILE.PREFIX}`).pipe(
      // delay(5000)
    ).subscribe(
      value => {
        console.info('LOADED FILES ', value);
        this.appStore.update(state => {
          state.currentMediaFiles = value;
        });
      }, error => {
        this.snackbar.sorry(error.error.error, {
          config: {
            duration: 50000,
            verticalPosition: "top"
          }
        });
      }
    );
  }

  public async addOrUpdateAction(action: Action) {
    let newActionId = action?.id ?? '';
    const isItNew = !newActionId;

    if (newActionId === '') {
      // add the action to api & await
      // todo response type
      const response = await this.tryHttpPost<Response>(`${API_BASE}${ENDPOINTS.CLIPS}`, action, {
        ok: true,
        id: uuid()
      });

      if (!response.ok) {
        return;
      }

      action.id = newActionId = response.id;
    } else {
      // add the action to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CLIPS}/${newActionId}`, action);
    }

    // add to the state
    this.appStore.update(state => {
      state.clips[newActionId] = action;
    });

    this.snackbar.normal(
      `Action "${action.name}"  ${isItNew ? 'added' : 'updated'}`
    );
  }

  public async deleteAction(actionId: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.CLIPS}/${actionId}`);

    // remove from state
    this.appStore.update(state => {
      deleteAction(state, actionId);
    });

    this.snackbar.normal('Action deleted!');
  }


  public async addOrUpdateTag(tag: Tag) {
    let newTagId = tag?.id ?? '';

    console.info({ tag });

    if (newTagId === '') {
      // add the action to api & await
      newTagId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TAGS}`, tag, uuid());

      tag.id = newTagId;
    } else {
      // add the action to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.TAGS}/${newTagId}`, tag);
    }

    // add to the state
    this.appStore.update(state => {
      state.tags[newTagId] = tag;
    });
  }

  public async deleteTag(tagId: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.TAGS}/${tagId}`);

    // TODO SHARED STATE OPERATIONS?

    // remove from state
    this.appStore.update(state => {
      delete state.tags[tagId];

      for (const action of Object.values(state.clips)) {
        if (action.tags && action.tags.includes(tagId)) {
          this.deleteInArray(action.tags, tagId);
        }
      }
    });

    this.snackbar.normal('Tag deleted!');
  }


  private deleteInArray(arr: any[], itemToDelete: any) {
    const itemIndex = arr.indexOf(itemToDelete);
    arr.splice(itemIndex, 1);
  }

  public async addOrUpdateScreen(screen: Screen) {
    const screensAvailable = Object.keys(this.appStore.getValue().screen).length > 0;
    let newId = screen?.id ?? '';

    if (newId === '') {
      // add the action to api & await
      const response = await this.tryHttpPost<Response>(`${API_BASE}${ENDPOINTS.SCREEN}`, screen, {
        ok: true,
        id: uuid()
      });

      if (!response.ok) {
        return;
      }

      newId = screen.id = response.id;
      screen.clips = {};
    } else {
      // add the action to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${newId}`, screen);
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[newId] = screen;
    });

    if (!screensAvailable) {
      // add all current actions to this newly created screen

      const allClips = Object.keys(this.appStore.getValue().clips);
      for (const clipKey of allClips) {
        await this.addScreenClipById(newId, clipKey);
      }
    }

    this.snackbar.normal('Screen updated!');
  }

  public async deleteScreen(id: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.SCREEN}/${id}`);

    // remove from state
    this.appStore.update(state => {
      delete state.screen[id];
    });

    this.snackbar.normal('Screen removed!');
  }

  public async addScreenClipById(screenId: string, clipId: string) {

    const screenClip: ScreenClip = {
      id: clipId,
      visibility: VisibilityEnum.Play
    };

    // add the action to api & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${clipId}`, screenClip);


    // add to the state
    this.appStore.update(state => {
      addOrUpdateScreenClip(state, screenId, screenClip);
    });


    this.snackbar.normal('Media saved!');
  }

  public async addOrUpdateScreenClip(screenId: string, screenClip: Partial<ScreenClip>) {
    screenClip = fillDefaultsScreenClip(screenClip);

    // add the action to api & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${screenClip.id}`, screenClip);

    const wasAlreadyAdded = !!this.appStore.getValue().screen[screenId].clips[screenClip.id];

    // add to the state
    this.appStore.update(state => {
      addOrUpdateScreenClip(state, screenId, screenClip);
    });

    this.snackbar.normal(`Media ${wasAlreadyAdded ? 'Settings updated' : 'added to screen'}!`);
  }

  // TODO rename action and screenclip settings
  public async addOrUpdateScreenActionInBulk(screenId: string, changedActions: Partial<ScreenClip>[]) {
    changedActions = changedActions.map(screenAction => fillDefaultsScreenClip(screenAction));

    // add the action to api & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/bulk`, changedActions);

    // add to the state
    this.appStore.update(state => {
      for (const changedAction of changedActions) {
        addOrUpdateScreenClip(state, screenId, changedAction);
      }
    });

    // todo rename those snackbars
    this.snackbar.normal(`Screen Media Settings updated!`);
  }

  public async deleteScreenClip(screenId: string, id: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${id}`);

    // remove from state
    this.appStore.update(state => {
      delete state.screen[screenId].clips[id];
    });


    this.snackbar.normal('Media removed from screen!');
  }

  public async addOrUpdateTimedEvent(event: TimedAction) {
    let newId = event?.id ?? '';
    const newEntry = !newId;

    if (newId === '') {
      // add the action to api & await
      newId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}`, event, uuid());

      event.id = newId;
    } else {
      // add the action to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}/${newId}`, event);
    }

    // add to the state
    this.appStore.update(state => {
      state.timers[newId] = event;
    });

    // TODO improve snackbar titles
    this.snackbar.normal(`Timer ${newEntry ? 'added' : 'updated'}`);
  }

  public async deleteTimedEvent(timerId: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}/${timerId}`);

    // remove from state
    this.appStore.update(state => {
      delete state.timers[timerId];
    });

    this.snackbar.normal('Timer removed!');
  }

  public async addOrUpdateTwitchEvent(event: TwitchTrigger) {
    let newId = event?.id ?? '';

    if (newId === '') {
      // add the action to api & await
      newId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}`, event, uuid());

      event.id = newId;
    } else {
      // TODO see if api call worked?

      // add the action to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}/${newId}`, event);
    }

    // add to the state
    this.appStore.update(state => {
      state.twitchEvents[newId] = event;
    });

    this.snackbar.normal('Twitch event added / updated!');
  }

  public async deleteTwitchEvent(clipId: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}/${clipId}`);

    // remove from state
    this.appStore.update(state => {
      delete state.twitchEvents[clipId];
    });

    this.snackbar.normal('Twitch event removed!');
  }

  public toggleTwitchActiveState(twitchId: string) {
    const twitchEvent = this.appStore.getValue().twitchEvents[twitchId];

    const newTwitchEventObject = {
      ...twitchEvent,
      active: !twitchEvent.active
    };

    return this.addOrUpdateTwitchEvent(newTwitchEventObject);
  }

  public toggleTimedClipActiveState(twitchId: string) {
    const timedEvent = this.appStore.getValue().timers[twitchId];

    const newTimedEventObject = {
      ...timedEvent,
      active: !timedEvent.active
    };

    return this.addOrUpdateTimedEvent(newTimedEventObject);
  }

  public postErrorToServer(error: Error) {
    console.error('logged error', error);

    // testing what is broken on the preview

    if (this.isOffline()) {
      return;
    }

    const logPayload: LogPayload = {
      message: `${error.name} ${error.message}`,
      stack: error.stack,
      url: location.href
    };

    this.http.post<string>(`${API_BASE}${ENDPOINTS.ERROR}`, logPayload).pipe(
      take(1)
    ).subscribe();
  }

  public duplicateAction(actionId: string) {
    // get the action byId
    const action = this.appStore.getValue().clips[actionId];

    // clone it && get a new ID
    const newAction: Action = {
      ...action,
      id: uuid(),
      name: `Cloned from: "${action.name}"`
    };


    // save it
    this.addOrUpdateAction(newAction);
  }


  public async checkVersionUpdateAvailable (): Promise<UpdateState> {
    try {
      const newVersionResponse = await this.http.get<UpdateState>(`${API_BASE}${ENDPOINTS.STATE}/update_available`)
        .pipe(
          take(1),
        ).toPromise();


      this.appStore.update(state => {
        state.update = newVersionResponse;
      });

      return newVersionResponse;
    } catch {
      return {
        available: false,
        version: 'none'
      };
    }
  }


  public channelPoints$(): Observable<ChannelPointRedemption[]> {
    return this.http.get<ChannelPointRedemption[]>(
      `${API_BASE}${ENDPOINTS.TWITCH_DATA.PREFIX}/currentChannelPointRedemptions`
    );
  }

  public tryHttpPostReturnString(url: string, data: unknown, offlineFallback: string){
    if (this.isOffline()) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<string>(url, data, {
      responseType: 'text' as any
    }).toPromise();
  }

  public tryHttpPost<TReturn>(url: string, data: unknown, offlineFallback: TReturn): Promise<TReturn> {
    if (this.isOffline()) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<TReturn>(url, data).toPromise();
  }


  public tryHttpGet<TResult>(url: string): Promise<TResult|undefined> {
    if (this.isOffline()) {
      return Promise.resolve<TResult|undefined>(undefined);
    }


    return this.http.get<TResult>(url).toPromise();
  }

  public tryHttpPut(url: string, postData: unknown){
    if (this.isOffline()) {
      return Promise.resolve();
    }

    return this.http.put<unknown>(url, postData).toPromise();
  }

  public tryHttpDelete(url: string){
    if (this.isOffline()) {
      return Promise.resolve();
    }

    return this.http.delete<unknown>(url).toPromise();
  }
}

// merge types once the tsconfig paths work
export interface LogPayload {
  message: string;
  filename?: string;
  linenumber?: string;
  stack: string;
  url: string;
}
