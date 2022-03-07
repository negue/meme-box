import {Injectable} from '@angular/core';
import {AppStore} from './app.store';
import {
  Action,
  AppState,
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
import {addOrUpdateScreenClip, deleteAction, fillDefaultsScreenClip} from '@memebox/shared-state';
import {uuid} from "@gewd/utils";
import {SnackbarService} from "../services/snackbar.service";
import {ConnectionStateService} from "./connection-state.service";
import {MemeboxApiService} from "./memeboxApi.service";
@Injectable({
  providedIn: "root"
})
export class AppService {

  constructor(private appStore: AppStore,
              private connectionState: ConnectionStateService,
              private memeboxApi: MemeboxApiService,
              private snackbar: SnackbarService) {
  }


  public async loadState(): Promise<void> {
    this.appStore.setLoading(true);

    try {
      const httpResult = await this.memeboxApi.get<AppState>('');

      this.connectionState.setOfflineMode(false);
      this.appStore.update(state => httpResult);

      this.appStore.setLoading(false);
    } catch (error: any) {
      if (error.name === 'HttpErrorResponse') {
        this.appStore.update(state => {
          state.offlineMode = true;
        });
        this.connectionState.setOfflineMode(true);

        console.error('Changing into offline mode', error);
      }
    }
  }

  public async listFiles() {
    try {
      const filesResult = await this.memeboxApi.get<FileInfo[]>(ENDPOINTS.FILE.PREFIX);

      if (filesResult) {
        this.appStore.update(state => {
          state.currentMediaFiles = filesResult;
        });
      }
    } catch (error) {
      this.snackbar.sorry(error.error.error, {
        config: {
          duration: 50000,
          verticalPosition: "top"
        }
      });
    }
  }

  public async addOrUpdateAction(action: Action) {
    let newActionId = action?.id ?? '';
    const isItNew = !newActionId;

    if (newActionId === '') {
      // add the action to api & await
      // todo response type
      const response = await this.memeboxApi.post<Response>(ENDPOINTS.CLIPS, action, {
        ok: true,
        id: uuid()
      });

      if (!response.ok) {
        return;
      }

      action.id = newActionId = response.id;
    } else {
      // add the action to api & await
      await this.memeboxApi.put(`${ENDPOINTS.CLIPS}/${newActionId}`, action);
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
    await this.memeboxApi.delete(`${ENDPOINTS.CLIPS}/${actionId}`);

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
      newTagId = await this.memeboxApi.postReturnString(ENDPOINTS.TAGS, tag, uuid());

      tag.id = newTagId;
    } else {
      // add the action to api & await
      await this.memeboxApi.put(`${ENDPOINTS.TAGS}/${newTagId}`, tag);
    }

    // add to the state
    this.appStore.update(state => {
      state.tags[newTagId] = tag;
    });
  }

  public async deleteTag(tagId: string) {
    // send the api call
    await this.memeboxApi.delete(`${ENDPOINTS.TAGS}/${tagId}`);

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
      const response = await this.memeboxApi.post<Response>(ENDPOINTS.SCREEN, screen, {
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
      await this.memeboxApi.put(`${ENDPOINTS.SCREEN}/${newId}`, screen);
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
    await this.memeboxApi.delete(`${ENDPOINTS.SCREEN}/${id}`);

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
    await this.memeboxApi.put(`${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${clipId}`, screenClip);

    // add to the state
    this.appStore.update(state => {
      addOrUpdateScreenClip(state, screenId, screenClip);
    });


    this.snackbar.normal('Media saved!');
  }

  public async addOrUpdateScreenClip(screenId: string, screenClip: Partial<ScreenClip>) {
    screenClip = fillDefaultsScreenClip(screenClip);

    // add the action to api & await
    await this.memeboxApi.put(`${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${screenClip.id}`, screenClip);

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
    await this.memeboxApi.put(`${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/bulk`, changedActions);

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
    await this.memeboxApi.delete(`${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${id}`);

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
      newId = await this.memeboxApi.postReturnString(ENDPOINTS.TIMED_EVENTS, event, uuid());

      event.id = newId;
    } else {
      // add the action to api & await
      await this.memeboxApi.put(`${ENDPOINTS.TIMED_EVENTS}/${newId}`, event);
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
    await this.memeboxApi.delete(`${ENDPOINTS.TIMED_EVENTS}/${timerId}`);

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
      newId = await this.memeboxApi.postReturnString(ENDPOINTS.TWITCH_EVENTS.PREFIX, event, uuid());

      event.id = newId;
    } else {
      // TODO see if api call worked?

      // add the action to api & await
      await this.memeboxApi.put(`${ENDPOINTS.TWITCH_EVENTS.PREFIX}/${newId}`, event);
    }

    // add to the state
    this.appStore.update(state => {
      state.twitchEvents[newId] = event;
    });

    this.snackbar.normal('Twitch event added / updated!');
  }

  public async deleteTwitchEvent(clipId: string) {
    // send the api call
    await this.memeboxApi.delete(`${ENDPOINTS.TWITCH_EVENTS.PREFIX}/${clipId}`);

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

    if (this.connectionState.isOffline()) {
      return;
    }

    const logPayload: LogPayload = {
      message: `${error.name} ${error.message}`,
      stack: error.stack,
      url: location.href
    };

    this.memeboxApi.postReturnString(ENDPOINTS.ERROR, logPayload, '');
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
      const newVersionResponse = await this.memeboxApi.get<UpdateState>(`${ENDPOINTS.STATE}/update_available`);

      if (newVersionResponse) {
        this.appStore.update(state => {
          state.update = newVersionResponse;
        });

        return newVersionResponse;
      }
    } catch {
      /* ignore errors */
    }

    return {
      available: false,
      version: 'none'
    };
  }

  public channelPointsAsync(): Promise<ChannelPointRedemption[] | undefined> {
    return this.memeboxApi.get<ChannelPointRedemption[]>(
      `${ENDPOINTS.TWITCH_DATA.PREFIX}/currentChannelPointRedemptions`
    );
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
