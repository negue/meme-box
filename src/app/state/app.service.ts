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
  CONFIG_ENDPOINT_PREFIX,
  CONFIG_OPEN_PATH,
  DANGER_CLEAN_CONFIG_ENDPOINT,
  DANGER_IMPORT_ALL_ENDPOINT,
  FILES_ENDPOINT,
  FILES_OPEN_ENDPOINT
} from '../../../server/constants';
import {SnackbarService} from '../core/services/snackbar.service';
import {AppConfig} from '@memebox/app/env';
import {setDummyData} from './app.dummy.data';
import {addOrUpdateScreenClip, deleteClip, fillDefaultsScreenClip} from '@memebox/state';
import {take} from 'rxjs/operators';
import {WebsocketService} from "../core/services/websocket.service";
import {uuid} from "@gewd/utils";

console.warn('APP.SERVICE.TS - AppConfig', AppConfig);

export const EXPRESS_BASE = AppConfig.expressBase;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;

const NOT_POSSIBLE_OFFLINE = 'Not possible in Offline-Mode.';

// TODO split up service per module??

export interface Response {
  ok: boolean;
  id?: string;
}

@Injectable()
export class AppService {
  private offlineMode = true;

  constructor(private appStore: AppStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
              private snackbar: SnackbarService,
              private websocketService: WebsocketService) {
  }

  public loadState() {
    this.appStore.setLoading(true);

    this.http.get(API_BASE).pipe(
      take(1)
      // delay(5000)
    ).subscribe(
      value => {
        this.offlineMode = false;
        console.info('LOADED STATE', value);
        this.appStore.update(state => value);

        console.info('UPDATED STATE', value);
        this.appStore.setLoading(false);
      }, (error: Error) => {
        if (error.name === 'HttpErrorResponse') {
          this.appStore.update(state => {
            state.offlineMode = true;
          });
          this.offlineMode = true;
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
      const response = await this.tryHttpPost<Response>(`${API_BASE}${ENDPOINTS.CLIPS}`, clip, {
        ok: true,
        id: uuid()
      });

      if (!response.ok) {
        return;
      }

      clip.id = newClipId = response.id;
    } else {
      // add the clip to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CLIPS}/${newClipId}`, clip);
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
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.CLIPS}/${clipId}`);

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
      newTagId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TAGS}`, tag, uuid());

      tag.id = newTagId;
    } else {
      // add the clip to api & await
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

  public async addOrUpdateScreen(screen: Screen) {
    const screensAvailable = Object.keys(this.appStore.getValue().screen).length > 0;
    let newId = screen?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
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
      // add the clip to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${newId}`, screen);
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[newId] = screen;
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

    // add the clip to api & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${clipId}`, screenClip);


    // add to the state
    this.appStore.update(state => {
      state.screen[screenId].clips[clipId] = screenClip;
    });


    this.snackbar.normal('Media saved!');
  }

  public async addOrUpdateScreenClip(screenId: string, screenClip: Partial<ScreenClip>) {
    screenClip = fillDefaultsScreenClip(screenClip);

    // add the clip to api & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${screenClip.id}`, screenClip);

    const wasAlreadyAdded = !!this.appStore.getValue().screen[screenId].clips[screenClip.id];

    // add to the state
    this.appStore.update(state => {
      addOrUpdateScreenClip(state, screenId, screenClip);
    });

    this.snackbar.normal(`Media ${wasAlreadyAdded ? 'Settings updated' : 'added to screen'}!`);
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

  public async addOrUpdateTimedEvent(event: TimedClip) {
    let newId = event?.id ?? '';
    const newEntry = !newId;

    if (newId === '') {
      // add the clip to api & await
      newId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TIMED_EVENTS}`, event, uuid());

      event.id = newId;
    } else {
      // add the clip to api & await
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

  public async addOrUpdateTwitchEvent(event: Twitch) {
    let newId = event?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.tryHttpPostReturnString(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}`, event, uuid());

      event.id = newId;
    } else {
      // TODO see if api call worked?

      // add the clip to api & await
      await this.tryHttpPut(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${newId}`, event);
    }

    // add to the state
    this.appStore.update(state => {
      state.twitchEvents[newId] = event;
    });

    this.snackbar.normal('Twitch event added / updated!');
  }

  public async deleteTwitchEvent(clipId: string) {
    // send the api call
    await this.tryHttpDelete(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${clipId}`);

    // remove from state
    this.appStore.update(state => {
      delete state.twitchEvents[clipId];
    });

    this.snackbar.normal('Twitch event removed!');
  }

  public async updateConfig(newConfig: Partial<Config>) {
    // update path & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG}`, newConfig);

    // update state
    this.appStore.update(state => {
      state.config = Object.assign({}, state.config, newConfig);
    });
  }

  public async updateCustomPort(newPort: number) {
    const newConfig = {
      newPort
    };

    // update path & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_CUSTOM_PORT_PATH}`, newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.customPort = newPort;
    });


    this.snackbar.normal('Custom Port updated!');
  }

  public async updateTwitchChannel(twitchChannel: string) {
    const newConfig: Partial<TwitchConfig> = {
      channel: twitchChannel
    };

    // update path & await
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_CHANNEL}`, newConfig);

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
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT}`, newConfig);

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
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_LOG}`, newConfig);

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
    await this.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT_INTEGRATION}`, newConfig);

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
    if (this.offlineMode) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.http.get<string>(`${EXPRESS_BASE}${FILES_OPEN_ENDPOINT}`).toPromise();
    }
  }

  public async openConfigFolder() {
    if (this.offlineMode) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.http.get<string>(`${EXPRESS_BASE}${CONFIG_ENDPOINT_PREFIX}${CONFIG_OPEN_PATH}`).toPromise();
    }
  }

  public fillDummyData() {
    this.appStore.update(state => {
      setDummyData(state);
    });

    this.websocketService.stopReconnects();
  }

  public async deleteAll() {
    if (this.offlineMode) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_CLEAN_CONFIG_ENDPOINT}`, null).toPromise();
      location.reload();
    }
  }

  public async importAll(body: any) {
    if (this.offlineMode) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_IMPORT_ALL_ENDPOINT}`, body).toPromise();
      location.reload();
    }
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
    debugger;
    if (this.offlineMode) {
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

  public tryHttpPostReturnString(url: string, data: unknown, offlineFallback: string){
    if (this.offlineMode) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<string>(url, data, {
      responseType: 'text' as any
    }).toPromise();
  }

  public tryHttpPost<TReturn>(url: string, data: unknown, offlineFallback: TReturn): Promise<TReturn> {
    if (this.offlineMode) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<TReturn>(url, data).toPromise();
  }

  public tryHttpPut(url: string, postData: unknown){
    if (this.offlineMode) {
      return Promise.resolve();
    }

    return this.http.put<unknown>(url, postData).toPromise();
  }

  public tryHttpDelete(url: string){
    if (this.offlineMode) {
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
