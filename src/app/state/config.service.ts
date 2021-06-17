import {Injectable} from '@angular/core';
import {AppStore} from './app.store';
import {HttpClient} from '@angular/common/http';
import {Config, ENDPOINTS, TwitchConfig} from '@memebox/contracts';
import {
  CONFIG_ENDPOINT_PREFIX,
  CONFIG_OPEN_PATH,
  DANGER_CLEAN_CONFIG_ENDPOINT,
  DANGER_IMPORT_ALL_ENDPOINT,
  FILES_OPEN_ENDPOINT
} from '../../../server/constants';
import {SnackbarService} from '../core/services/snackbar.service';
import {setDummyData} from './app.dummy.data';
import {WebsocketService} from "../core/services/websocket.service";
import {API_BASE, AppService, EXPRESS_BASE} from "./app.service";

const NOT_POSSIBLE_OFFLINE = 'Not possible in Offline-Mode.';


@Injectable()
export class ConfigService {
  private offlineMode = true;

  constructor(private appStore: AppStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
              private snackbar: SnackbarService,
              private websocketService: WebsocketService,
              private appService: AppService) {
  }

  public async updateConfig(newConfig: Partial<Config>) {
    // update path & await
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG}`, newConfig);

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
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_CUSTOM_PORT_PATH}`, newConfig);

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
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_CHANNEL}`, newConfig);

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
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT}`, newConfig);

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
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_LOG}`, newConfig);

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
    await this.appService.tryHttpPut(`${API_BASE}${ENDPOINTS.CONFIG_TWITCH_BOT_INTEGRATION}`, newConfig);

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
}
