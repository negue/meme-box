import {Injectable} from '@angular/core';
import {AppStore} from '../state/app.store';
import {HttpClient} from '@angular/common/http';
import {
  Config,
  ENDPOINTS,
  ObsConfig,
  TwitchAuthInformation,
  TwitchConfig,
  TwitchConnectionType
} from '@memebox/contracts';
import {DANGER_CLEAN_CONFIG_ENDPOINT, DANGER_IMPORT_ALL_ENDPOINT} from '../../../../../server/constants';
import {setDummyData} from '../state/app.dummy.data';
import {MemeboxWebsocketService} from "./memebox-websocket.service";
import {AppService} from "../state/app.service";
import {SnackbarService} from "./snackbar.service";
import {EXPRESS_BASE, MemeboxApiService} from "../state/memeboxApi.service";
import {ConnectionStateService} from "../state/connection-state.service";

const NOT_POSSIBLE_OFFLINE = 'Not possible in Offline-Mode.';

@Injectable({
  providedIn: "root"
})
export class ConfigService {

  constructor(private appStore: AppStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
              private snackbar: SnackbarService,
              private websocketService: MemeboxWebsocketService,
              private appService: AppService,
              private memeboxApi: MemeboxApiService,
              private connectionStateService: ConnectionStateService) {
  }

  public async updateConfig(newConfig: Partial<Config>) {
    // update path & await
    await this.memeboxApi.put( this.configEndpoint(''), newConfig);

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
    await this.memeboxApi.put( this.configEndpoint(ENDPOINTS.CONFIG.CUSTOM_PORT), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.customPort = newPort;
    });


    this.snackbar.normal('Custom Port updated!');
  }

  public async updateObsConfig(newConfig: Partial<ObsConfig>) {
    // update path & await
    await this.memeboxApi.put(this.configEndpoint(ENDPOINTS.CONFIG.OBS), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.obs = newConfig as ObsConfig;
    });

    this.snackbar.normal('Obs Config updated!');
  }


  public async updateTwitchConfig(newConfig: Partial<TwitchConfig>) {
    // update path & await
    await this.memeboxApi.put(this.configEndpoint(ENDPOINTS.CONFIG.TWITCH), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.twitch = newConfig as TwitchConfig;
    });

    this.snackbar.normal('Twitch Config updated!');
  }


  public async revokeToken(tokenType: TwitchConnectionType) {
    // update path & await
    await this.memeboxApi.delete(this.configEndpoint(ENDPOINTS.CONFIG.TWITCH_REVOKE) + tokenType);

    // add to the state
    this.appStore.update(state => {
      const config = state.config;

      if (!config?.twitch) {
        return;
      }

      if (tokenType === 'MAIN') {
        config.twitch.token = null;
      }

      if (tokenType === 'BOT' && config.twitch.bot?.auth) {
        config.twitch.bot.auth.token = null;
      }

      state.config = config;
    });

    this.snackbar.normal('Twitch Login revoked');
  }



  public async openMediaFolder() {
    if (this.connectionStateService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.memeboxApi.get<string>(this.openEndpoint(ENDPOINTS.OPEN.FILES));
    }
  }

  public async openConfigFolder() {
    if (this.connectionStateService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.memeboxApi.get<string>(this.openEndpoint(ENDPOINTS.OPEN.CONFIG));
    }
  }

  public fillDummyData() {
    this.appStore.update(state => {
      setDummyData(state);
    });

    this.websocketService.stopReconnects();
  }

  public async deleteAll() {
    if (this.connectionStateService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_CLEAN_CONFIG_ENDPOINT}`, null).toPromise();
      location.reload();
    }
  }

  public async importAll(body: any) {
    if (this.connectionStateService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_IMPORT_ALL_ENDPOINT}`, body).toPromise();
      location.reload();
    }
  }


  public loadTwitchAuthInformations(): Promise<TwitchAuthInformation[]|undefined> {
    return this.memeboxApi.get<TwitchAuthInformation[]>(`${ENDPOINTS.TWITCH_DATA.PREFIX}${ENDPOINTS.TWITCH_DATA.AUTH_INFORMATIONS}`);
  }


  private configEndpoint(endpoint: string) {
    return `${ENDPOINTS.CONFIG.PREFIX}${endpoint}`;
  }

  private openEndpoint(endpoint: string) {
    return `${ENDPOINTS.OPEN.PREFIX}${endpoint}`;
  }
}
