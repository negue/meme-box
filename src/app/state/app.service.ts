import {Injectable} from '@angular/core';
import {AppStore} from './app.store';
import {HttpClient} from '@angular/common/http';
import {
  Clip,
  Config,
  ENDPOINTS,
  FileInfo,
  Screen,
  ScreenClip,
  Tag,
  TimedClip,
  Twitch,
  TwitchConfig,
  UpdateState,
  VisibilityEnum
} from '@memebox/contracts';
import {
  API_PREFIX,
  CONFIG_ENDPOINT,
  CONFIG_OPEN_PATH,
  DANGER_CLEAN_CONFIG_ENDPOINT,
  DANGER_IMPORT_ALL_ENDPOINT,
  FILES_ENDPOINT,
  FILES_OPEN_ENDPOINT
} from '../../../server/constants';
import {SnackbarService} from '../core/services/snackbar.service';
import {AppConfig} from '@memebox/app/env';
import {setDummyData} from './app.dummy.data';
import {deleteClip} from '../../../projects/state/src/lib/operations/clip.operations';
import {take} from 'rxjs/internal/operators';

export const EXPRESS_BASE = AppConfig.expressBase;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;

// TODO split up service per module??

export interface Response {
  ok: boolean;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private appStore: AppStore,
              private http: HttpClient,
              private snackbar: SnackbarService) {
  }

  public loadState() {
    this.appStore.setLoading(true);

    this.http.get(API_BASE).pipe(
      // delay(5000)
    ).subscribe(
      value => {
        console.info('LOADED STATE', value);
        this.appStore.update(state => value);

        console.info('UPDATED STATE', value);
        this.appStore.setLoading(false);
      }, (error: Error) => {
        if (error.name === 'HttpErrorResponse') {
          this.appStore.update(state => {
            state.offlineMode = true;
          });
          console.error('Changing into offline mode', error);
        }

      }
    );
  }

  public listFiles() {
    this.http.get<FileInfo[]>(`${EXPRESS_BASE}${FILES_ENDPOINT}`).pipe(
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

  public async addOrUpdateClip(clip: Clip) {
    let newClipId = clip?.id ?? '';
    const isItNew = !newClipId;


    console.info({ clip });

    if (newClipId === '') {
      // add the clip to api & await
      // todo response type
      const response = await this.http.post<Response>(`${API_BASE}${ENDPOINTS.CLIPS}`, clip).toPromise();

      if (!response.ok) {
        return;
      }

      clip.id = newClipId = response.id;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.CLIPS}/${newClipId}`, clip).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.clips[newClipId] = clip;
    });

    this.snackbar.normal(
      `Clip "${clip.name}"  ${isItNew ? 'added' : 'updated'}`
    );
  }

  public async deleteClip(clipId: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.CLIPS}/${clipId}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      deleteClip(state, clipId);
    });

    this.snackbar.normal('Media deleted!');
  }


  public async addOrUpdateTag(tag: Tag) {
    let newTagId = tag?.id ?? '';

    console.info({ tag });

    if (newTagId === '') {
      // add the clip to api & await
      newTagId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.TAGS}`, tag, {
        responseType: 'text' as any
      }).toPromise();

      tag.id = newTagId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.TAGS}/${newTagId}`, tag).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.tags[newTagId] = tag;
    });
  }

  public async deleteTag(tagId: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.TAGS}/${tagId}`).toPromise();

    // TODO SHARED STATE OPERATIONS?

    // remove from state
    this.appStore.update(state => {
      delete state.tags[tagId];

      for (const clip of Object.values(state.clips)) {
        if (clip.tags && clip.tags.includes(tagId)) {
          this.deleteInArray(clip.tags, tagId);
        }
      }
    });

    this.snackbar.normal('Tag deleted!');
  }


  private deleteInArray(arr: any[], itemToDelete: any) {
    const itemIndex = arr.indexOf(itemToDelete);
    arr.splice(itemIndex, 1);
  }

  public async addOrUpdateScreen(url: Screen) {
    const screensAvailable = Object.keys(this.appStore.getValue().screen).length > 0;
    let newId = url?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      const response = await this.http.post<{ ok: boolean, id: string }>(`${API_BASE}${ENDPOINTS.SCREEN}`, url).toPromise();

      if (!response.ok) {
        return;
      }

      newId = url.id = response.id;
      url.clips = {};
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${newId}`, url).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[newId] = url;
    });

    if (!screensAvailable) {
      // add all current clips to this newly created screen

      const allClips = Object.keys(this.appStore.getValue().clips);
      for (const clipKey of allClips) {
        await this.addScreenClipById(newId, clipKey);
      }
    }

    this.snackbar.normal('Screen updated!');
  }

  public async deleteScreen(id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${id}`).toPromise();

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

    // add the clip to api & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${clipId}`, screenClip).toPromise();


    // add to the state
    this.appStore.update(state => {
      state.screen[screenId].clips[clipId] = screenClip;
    });


    this.snackbar.normal('Media saved!');
  }

  public async addOrUpdateScreenClip(screenId: string, screenClip: Partial<ScreenClip>) {
    // add the clip to api & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${screenClip.id}`, screenClip).toPromise();

    const wasAlreadyAdded = !!this.appStore.getValue().screen[screenId].clips[screenClip.id];

    // add to the state
    this.appStore.update(state => {
      state.screen[screenId].clips[screenClip.id] = screenClip as ScreenClip;
    });

    this.snackbar.normal(`Media ${wasAlreadyAdded ? 'Settings updated' : 'added to screen'}!`);
  }

  public async deleteScreenClip(screenId: string, id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${id}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.screen[screenId].clips[id];
    });


    this.snackbar.normal('Media removed from screen!');
  }

  public async addOrUpdateTimedEvent(event: TimedClip) {
    let newId = event?.id ?? '';
    const newEntry = !newId;

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}`, event, {
        responseType: 'text' as any
      }).toPromise();

      event.id = newId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}/${newId}`, event).toPromise();
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
    await this.http.delete(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}/${timerId}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.timers[timerId];
    });

    this.snackbar.normal('Timer removed!');
  }

  public async addOrUpdateTwitchEvent(event: Twitch) {
    let newId = event?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}`, event, {
        responseType: 'text' as any
      }).toPromise();

      event.id = newId;
    } else {
      // TODO see if api call worked?

      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${newId}`, event).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.twitchEvents[newId] = event;
    });

    this.snackbar.normal('Twitch event added / updated!');
  }

  public async deleteTwitchEvent(clipId: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${clipId}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.twitchEvents[clipId];
    });

    this.snackbar.normal('Twitch event removed!');
  }

  public async updateConfig(newConfig: Partial<Config>) {
    // update path & await
    await this.http.put<Response>(`${API_BASE}${ENDPOINTS.CONFIG}`, newConfig).toPromise();

    // update state
    this.appStore.update(state => {
      state.config = Object.assign({}, state.config, newConfig);
    });
  }

  public async updateTwitchChannel(twitchChannel: string) {
    const newConfig: Partial<TwitchConfig> = {
      channel: twitchChannel
    };

    // update path & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_CHANNEL}`, newConfig).toPromise();

    // add to the state
    this.appStore.update(state => {
      state.config.twitch.channel = twitchChannel;
    });


    this.snackbar.normal('Twitch Channel updated!');
  }

  public async updateTwitchBotData(twitchBotConfig: TwitchConfig) {
    const newConfig: Partial<Config> = {
      twitch: twitchBotConfig
    };

    // update path & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT}`, newConfig).toPromise();

    // add to the state
    this.appStore.update(state => {
      state.config.twitch = twitchBotConfig;
    });

    this.snackbar.normal('Twitch Bot settings updated!');
  }

  public async updateTwitchLogs(enabled: boolean) {
    const newConfig: Partial<TwitchConfig> = {
      enableLog: enabled
    };

    // update path & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_LOG}`, newConfig).toPromise();

    // add to the state
    this.appStore.update(state => {
      state.config.twitch.enableLog = enabled;
    });


    this.snackbar.normal(`Twitch Logging ${enabled ? 'enabled' : 'disabled'}!`);
  }

  public async updateTwitchBotIntegration(enabled: boolean) {
    const newConfig: Partial<TwitchConfig> = {
      bot: {
        response: '',
        enabled: enabled
      }
    };

    // update path & await
    await this.http.put<string>(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT_INTEGRATION}`, newConfig).toPromise();

    // add to the state
    this.appStore.update(state => {
      if (!state.config.twitch.bot) {
        state.config.twitch.bot = {
          response: '',
          enabled: enabled
        };
      }

      state.config.twitch.bot.enabled = enabled;
    });

    this.snackbar.normal(`Twitch bot ${enabled ? 'enabled' : 'disabled'}!`);
  }

  public async openMediaFolder() {
    // update path & await
    await this.http.get<string>(`${EXPRESS_BASE}${FILES_OPEN_ENDPOINT}`).toPromise();
  }

  public async openConfigFolder() {
    // update path & await
    await this.http.get<string>(`${EXPRESS_BASE}${CONFIG_ENDPOINT}${CONFIG_OPEN_PATH}`).toPromise();
  }

  fillDummyData() {
    this.appStore.update(state => {
      setDummyData(state);
    });
  }

  async deleteAll() {
    await this.http.post<any>(`${EXPRESS_BASE}${DANGER_CLEAN_CONFIG_ENDPOINT}`, null).toPromise();
    location.reload();
  }

  async importAll(body: any) {
    await this.http.post<any>(`${EXPRESS_BASE}${DANGER_IMPORT_ALL_ENDPOINT}`, body).toPromise();
    location.reload();
  }

  toggleTwitchActiveState(twitchId: string) {
    const twitchEvent = this.appStore.getValue().twitchEvents[twitchId];

    const newTwitchEventObject = {
      ...twitchEvent,
      active: !twitchEvent.active
    };

    return this.addOrUpdateTwitchEvent(newTwitchEventObject);
  }

  toggleTimedClipActiveState(twitchId: string) {
    const timedEvent = this.appStore.getValue().timers[twitchId];

    const newTimedEventObject = {
      ...timedEvent,
      active: !timedEvent.active
    };

    return this.addOrUpdateTimedEvent(newTimedEventObject);
  }

  public postErrorToServer(error: Error) {
    console.error('logged error', error);

    const logPayload: LogPayload = {
      message: `${error.name} ${error.message}`,
      stack: error.stack,
      url: location.href
    };

    this.http.post<string>(`${API_BASE}${ENDPOINTS.ERROR}`, logPayload).pipe(
      take(1)
    ).subscribe();
  }

  public async checkVersionUpdateAvailable (): Promise<UpdateState> {
    const newVersionResponse = await this.http.get<UpdateState>(`${API_BASE}${ENDPOINTS.STATE}/update_available`)
      .pipe(
        take(1),
      ).toPromise();

    this.appStore.update(state => {
      state.update = newVersionResponse;
    });

    return newVersionResponse;
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
