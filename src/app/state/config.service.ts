import {Injectable} from '@angular/core';
import {AppStore} from './app.store';
import {HttpClient} from '@angular/common/http';
import {
  Config,
  CONFIG_CUSTOM_PORT_PATH,
  CONFIG_OBS,
  CONFIG_TWITCH,
  ENDPOINTS,
  ObsConfig,
  OPEN_CONFIG_PATH,
  OPEN_FILES_PATH,
  TwitchConfig
} from '@memebox/contracts';
import {DANGER_CLEAN_CONFIG_ENDPOINT, DANGER_IMPORT_ALL_ENDPOINT} from '../../../server/constants';
import {SnackbarService} from '../core/services/snackbar.service';
import {setDummyData} from './app.dummy.data';
import {WebsocketService} from "../core/services/websocket.service";
import {API_BASE, AppService, EXPRESS_BASE} from "./app.service";

const NOT_POSSIBLE_OFFLINE = 'Not possible in Offline-Mode.';


@Injectable()
export class ConfigService {

  constructor(private appStore: AppStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
              private snackbar: SnackbarService,
              private websocketService: WebsocketService,
              private appService: AppService) {
  }

  public async updateConfig(newConfig: Partial<Config>) {
    // update path & await
    await this.appService.tryHttpPut( this.configEndpoint(''), newConfig);

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
    await this.appService.tryHttpPut( this.configEndpoint(CONFIG_CUSTOM_PORT_PATH), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.customPort = newPort;
    });


    this.snackbar.normal('Custom Port updated!');
  }

  public async updateObsConfig(newConfig: Partial<ObsConfig>) {
    // update path & await
    await this.appService.tryHttpPut(this.configEndpoint(CONFIG_OBS), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.obs = newConfig as ObsConfig;
    });

    this.snackbar.normal('Obs Config updated!');
  }


  public async updateTwitchConfig(newConfig: Partial<TwitchConfig>) {
    // update path & await
    await this.appService.tryHttpPut(this.configEndpoint(CONFIG_TWITCH), newConfig);

    // add to the state
    this.appStore.update(state => {
      state.config.twitch = newConfig as TwitchConfig;
    });

    this.snackbar.normal('Twitch Config updated!');
  }

  public async openMediaFolder() {
    if (this.appService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.http.get<string>(this.openEndpoint(OPEN_FILES_PATH)).toPromise();
    }
  }

  public async openConfigFolder() {
    if (this.appService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      // update path & await
      await this.http.get<string>(this.openEndpoint(OPEN_CONFIG_PATH)).toPromise();
    }
  }

  public fillDummyData() {
    this.appStore.update(state => {
      setDummyData(state);
    });

    this.websocketService.stopReconnects();
  }

  public async deleteAll() {
    if (this.appService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_CLEAN_CONFIG_ENDPOINT}`, null).toPromise();
      location.reload();
    }
  }

  public async importAll(body: any) {
    if (this.appService.isOffline()) {
      this.snackbar.sorry(NOT_POSSIBLE_OFFLINE);
    } else {
      await this.http.post<any>(`${EXPRESS_BASE}${DANGER_IMPORT_ALL_ENDPOINT}`, body).toPromise();
      location.reload();
    }
  }

  private configEndpoint(endpoint: string) {
    return `${API_BASE}${ENDPOINTS.CONFIG}${endpoint}`;
  }

  private openEndpoint(endpoint: string) {
    return `${API_BASE}${ENDPOINTS.OPEN}${endpoint}`;
  }
}
