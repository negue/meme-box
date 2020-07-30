import {Injectable} from '@angular/core';
import {AppStore} from "./app.store";
import {HttpClient} from "@angular/common/http";
import {Clip, ENDPOINTS, Screen, ScreenClip, Twitch} from "@memebox/contracts";
import {API_PREFIX, EXPRESS_PORT} from "../../../server/constants";
import {MatSnackBar} from "@angular/material/snack-bar";

export const EXPRESS_BASE = `http://${location.hostname}:${EXPRESS_PORT}`;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;

const SNACKBAR_DURATION = 3000;

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private appStore: AppStore,
              private http: HttpClient,
              private snackbar: MatSnackBar) {}

  public loadState() {
    this.appStore.setLoading(true);

    this.http.get(API_BASE).pipe(
      // delay(5000)
    ).subscribe(
      value => {
        this.appStore.update(state => value);
        this.appStore.setLoading(false);
      }
    )
  }

  public async addOrUpdateClip (clip: Clip) {
    let newClipId = clip?.id ?? '';

    if (newClipId === '') {
      // add the clip to api & await
      newClipId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.CLIPS}`, clip, {
        responseType: 'text' as any
      }).toPromise();

      clip.id = newClipId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.CLIPS}/${newClipId}`, clip).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.clips[newClipId]  = clip;
    });
  }

  public async deleteClip(clipId: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.CLIPS}/${clipId}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.clips[clipId];
    });

    this.snackbar.open('Clip removed.', null, {
      duration: SNACKBAR_DURATION,
    });
  }


  public async addOrUpdateScreen (url: Screen) {
    let screensAvailable = Object.keys(this.appStore.getValue().screen).length > 0;
    let newId = url?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.SCREEN}`, url, {
        responseType: 'text' as any
      }).toPromise();

      url.id = newId;
      url.clips = {};
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${newId}`, url).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[newId]  = url;
    });

    if (!screensAvailable) {
      // add all current clips to this newly created screen

      const allClips = Object.keys(this.appStore.getValue().clips);
      for (const clipKey of allClips) {
        await this.addScreenClipById(newId, clipKey);
      }
    }
  }

  public async deleteScreen(id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${id}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.screen[id];
    });

    this.snackbar.open('Screen removed.'), null, {
      duration: SNACKBAR_DURATION,
    };
  }

  public async addScreenClipById (screenId: string, clipId: string) {

      const screenClip:ScreenClip = {
        id: clipId
      };

      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${clipId}`, screenClip).toPromise();


    // add to the state
    this.appStore.update(state => {
      state.screen[screenId].clips[clipId] = screenClip as ScreenClip;
    });


    this.snackbar.open('Screen/Clip Assignment saved.', null, {
      duration: SNACKBAR_DURATION,
    });
  }

  public async addOrUpdateScreenClip (screenId: string, obsClip: Partial<ScreenClip>) {
    let newId = obsClip?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}`, obsClip, {
        responseType: 'text' as any
      }).toPromise();

      obsClip.id = newId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${newId}`, obsClip).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[screenId].clips[newId] = obsClip as ScreenClip;
    });

    this.snackbar.open('Screen/Clip Assignment saved.', null, {
      duration: SNACKBAR_DURATION,
    });
  }

  public async deleteScreenClip(screenId: string, id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${screenId}/${ENDPOINTS.OBS_CLIPS}/${id}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.screen[screenId].clips[id];
    });


    this.snackbar.open('Screen/Clip Assignment removed.', null, {
      duration: SNACKBAR_DURATION,
    });
  }


  public async addOrUpdateTwitchEvent (event: Twitch) {
    let newId = event?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}`, event, {
        responseType: 'text' as any
      }).toPromise();

      event.id = newId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${newId}`, event).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.twitchEvents[newId]  = event;
    });
  }

  public async deleteTwitchEvent(clipId: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS}/${clipId}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.twitchEvents[clipId];
    });

    this.snackbar.open('Twitch-Event removed.', null, {
      duration: SNACKBAR_DURATION,
    });
  }

}
