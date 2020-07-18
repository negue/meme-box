import {Injectable} from '@angular/core';
import {AppStore} from "./app.store";
import {HttpClient} from "@angular/common/http";
import {Clip, ENDPOINTS, Screen, ScreenClip, Twitch} from "@memebox/contracts";
import {API_PREFIX, EXPRESS_PORT} from "../../../server/constants";

export const EXPRESS_BASE = `http://localhost:${EXPRESS_PORT}`;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private appStore: AppStore,
              private http: HttpClient) {}

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
  }


  public async addOrUpdateScreen (url: Screen) {
    let newId = url?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.SCREEN}`, url, {
        responseType: 'text' as any
      }).toPromise();

      url.id = newId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${newId}`, url).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[newId]  = url;
    });
  }

  public async deleteScreen(id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${id}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.screen[id];
    });
  }


  public async addOrUpdateScreenClip (obsUrlId: string, obsClip: Partial<ScreenClip>) {
    let newId = obsClip?.id ?? '';

    if (newId === '') {
      // add the clip to api & await
      newId = await this.http.post<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${obsUrlId}/${ENDPOINTS.OBS_CLIPS}`, obsClip, {
        responseType: 'text' as any
      }).toPromise();

      obsClip.id = newId;
    } else {
      // add the clip to api & await
      await this.http.put<string>(`${API_BASE}${ENDPOINTS.SCREEN}/${obsUrlId}/${ENDPOINTS.OBS_CLIPS}/${newId}`, obsClip).toPromise();
    }

    // add to the state
    this.appStore.update(state => {
      state.screen[obsUrlId].clips[newId] = obsClip as any; // todo types ...
    });
  }

  public async deleteScreenClip(obsUrlId: string, id: string) {
    // send the api call
    await this.http.delete(`${API_BASE}${ENDPOINTS.SCREEN}/${obsUrlId}/${ENDPOINTS.OBS_CLIPS}/${id}`).toPromise();

    // remove from state
    this.appStore.update(state => {
      delete state.screen[obsUrlId].clips[id];
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
  }

}
