import * as fs from 'fs';
import {
  Action,
  ChangedInfo,
  Config,
  createInitialState,
  ObsConfig,
  PositionEnum,
  Screen,
  ScreenMedia,
  SettingsState,
  Tag,
  TimedAction,
  TwitchConfig,
  TwitchTrigger,
  VisibilityEnum
} from '@memebox/contracts';
import {Observable, Subject} from "rxjs";
import * as path from "path";
import {
  deleteInArray,
  deleteItemInDictionary,
  simpleDateString,
  sortActions,
  updateItemInDictionary
} from "@memebox/utils";
import {createDirIfNotExists, LOG_PATH, NEW_CONFIG_PATH} from "./path.utils";
import {operations} from '@memebox/shared-state';
import {debounceTime} from "rxjs/operators";
import {LOGGER, newLogger} from "./logger.utils";
import {registerProvider} from "@tsed/di";
import {PERSISTENCE_DI} from "./providers/contracts";
import {CLI_OPTIONS} from "./utils/cli-options";
import cloneDeep from 'lodash/cloneDeep';
import {uuid} from '@gewd/utils';
import {saveFile, SavePreviewFile} from "./persistence.functions";
import {upgradeConfigFile} from './config-file-upgrade';

// TODO Extract more state operations to shared library and from app

let fileBackupToday = false;

export const TOKEN_EXISTS_MARKER = 'TOKEN_EXISTS';

// TODO use const string enums instead of uniontype

export class Persistence {

  public configLoaded$ = new Subject();

  private updated$ = new Subject<ChangedInfo>();
  private _hardRefresh$ = new Subject();
  private data: SettingsState = Object.assign({}, createInitialState());

  private logger  = newLogger('Persistence');

  constructor(private filePath: string) {
    const dir = path.dirname(filePath);

    // if the settings folder not exist
    // create it
    createDirIfNotExists(dir);

    // Read the file
    fs.readFile(filePath, {
      encoding: 'utf8',
      flag: 'a+' // open or create if not exist
    }, (err, data) => {
      if (err) {
        return this.logger.error(err, "Error reading the settings.json");
      }

      let dataFromFile = {};

      if (data && data.includes('{')) {
        dataFromFile = JSON.parse(data);
      }
      // execute upgrade , changing names or other stuff

      this.data = Object.assign({}, createInitialState(), upgradeConfigFile(dataFromFile as any));
      this.updated$.next({
        dataType: 'everything',
        changeType: 'changed'
      });

      this.configLoaded$.next();

      this.logger.info('Settings loaded');

      if (!fileBackupToday) {
        const targetDir = path.dirname(this.filePath);
        const targetFileName = path.basename(this.filePath);

        const backupPathFile = `${targetDir}/backups/${targetFileName}.${simpleDateString()}.backup`;

        saveFile(backupPathFile, data);

        fileBackupToday = true;
      }
    });

    this.updated$.pipe(
      debounceTime(2000)
    ).subscribe(() => {
      this.logger.info('Data saved!');
      saveFile(this.filePath, this.data, true);
    });
  }


  /**
   * If you need to move values from config version to a new one
   *
   * @param configFromFile
   */


  public dataUpdated$ () : Observable<ChangedInfo> {
    return this.updated$.asObservable();
  }

  public hardRefresh$ () : Observable<any> {
    return this._hardRefresh$.asObservable();
  }


  public fullState() {
    return {
      ...this.data,
      config: this.getConfig()
    };
  }

  // save it on changes
  // return sub data off it

  /*
   *  Actions Persistence
   */

  public addAction(action: Action): string  {
    action.id = uuid();
    SavePreviewFile(action);
    operations.addAction(this.data, action, true);

    this.saveData({
      dataType: 'action',
      actionType: action.type,
      changeType: 'added',
      id: action.id
    });

    return action.id;
  }

  public updateAction(id: string, action: Action) {
    SavePreviewFile(action);
    action.id = id;
    updateItemInDictionary(this.data.clips, action);

    this.saveData({
      dataType: 'action',
      actionType: action.type,
      changeType: 'changed',
      id: action.id
    });

    return action;
  }

  public deleteAction(id: string): void  {
    const actionType = this.data.clips[id].type;

    operations.deleteAction(this.data, id);

    this.saveData({
      dataType: 'action',
      actionType: actionType,
      changeType: 'removed',
      id
    });
  }

  public listActions(): Action[] {
    return sortActions(Object.values(this.data.clips));
  }


  /*
   *  Tags Persistence
   */

  public addTag(tag: Tag): string  {
    tag.id = uuid();
    this.data.tags[tag.id] = tag;

    this.saveData({
      dataType: 'tags',
      changeType: 'added',
      id: tag.id
    });

    return tag.id;
  }

  public updateTag(id: string, tag: Tag) {
    tag.id = id;
    updateItemInDictionary(this.data.tags, tag);

    this.saveData({
      dataType: 'tags',
      changeType: 'changed',
      id: tag.id
    });

    return tag;
  }

  // TODO Extract shared state logic between app/ server
  public deleteTag(id: string): void  {
    deleteItemInDictionary(this.data.tags, id);

    for(const action of Object.values(this.data.clips)) {
      if (action.tags && action.tags.includes(id)) {
        deleteInArray(action.tags, id);
      }
    }

    this.saveData({
      dataType: 'tags',
      changeType: 'removed',
      id
    });
  }

  public listTags(): Tag[] {
    return Object.values(this.data.tags);
  }


  /*
   *  Screens Persistence
   */

  public addScreen(screen: Partial<Screen>): string  {
    operations.addScreen(this.data, screen);

    this.saveData({
      dataType: 'screens',
      changeType: 'added',
      id: screen.id
    });
    return screen.id;
  }

  public updateScreen(id: string, screen: Screen) {
    screen.id = id;

    updateItemInDictionary(this.data.screen, screen);

    this.saveData({
      dataType: 'screens',
      changeType: 'changed',
      id: screen.id
    });

    return screen;
  }

  public deleteScreen(id: string): void  {
    deleteItemInDictionary(this.data.screen, id);

    this.saveData({
      dataType: 'screens',
      changeType: 'removed',
      id
    });
  }

  public listScreens(): Screen[] {
    return Object.values(this.data.screen);
  }

  /*
   *  Screen Clips Settings
   */

  public updateScreenClip(targetUrlId: string, id: string, screenClip: ScreenMedia) {
    screenClip.id = id;

    operations.addOrUpdateScreenClip(this.data, targetUrlId, screenClip);

    this.saveData({
      dataType: 'screen-action-config',
      changeType: 'changed',
      id,
      targetScreenId: targetUrlId
    });

    return screenClip;
  }

  public deleteScreenClip(targetUrlId: string, id: string): void  {
    deleteItemInDictionary(this.data.screen[targetUrlId].clips, id);


    this.saveData({
      dataType: 'screen-action-config',
      changeType: 'removed',
      id,
      targetScreenId: targetUrlId
    });
  }



  /*
   *  Twitch Event Settings
   */

  public addTwitchEvent(twitchEvent: TwitchTrigger): string  {
    twitchEvent.id = uuid();
    this.data.twitchEvents[twitchEvent.id] = twitchEvent;

    this.saveData({
      dataType: 'twitch-events',
      changeType: 'added',
      id: twitchEvent.id
    });

    return twitchEvent.id;
  }

  public updateTwitchEvent(id: string, twitchEvent: TwitchTrigger) {
    twitchEvent.id = id;

    updateItemInDictionary(this.data.twitchEvents, twitchEvent);

    this.saveData({
      dataType: 'twitch-events',
      changeType: 'changed',
      id: twitchEvent.id
    });

    return twitchEvent;
  }

  public deleteTwitchEvent(id: string): void  {
    deleteItemInDictionary(this.data.twitchEvents, id);


    this.saveData({
      dataType: 'twitch-events',
      changeType: 'removed',
      id
    });
  }

  public listTwitchEvents(): TwitchTrigger[] {
    return Object.values(this.data.twitchEvents);
  }


  /*
   *  Timed Actions Settings
   */

  public addTimedEvent(timedEvent: TimedAction): string  {
    timedEvent.id = uuid();
    this.data.timers[timedEvent.id] = timedEvent;

    this.saveData({
      dataType: 'timers',
      changeType: 'added',
      id: timedEvent.id
    });
    return timedEvent.id;
  }

  public updateTimedEvent(id: string, timedEvent: TimedAction) {
    timedEvent.id = id;

    updateItemInDictionary(this.data.timers, timedEvent);

    this.saveData({
      dataType: 'timers',
      changeType: 'changed',
      id: timedEvent.id
    });

    return timedEvent;
  }

  public deleteTimedEvent(id: string): void  {
    deleteItemInDictionary(this.data.timers, id);


    this.saveData({
      dataType: 'timers',
      changeType: 'removed',
      id
    });
  }

  public listTimedEvents(): TimedAction[] {
    return Object.values(this.data.timers);
  }

  /*
   *  General Settings
   */

  // TODO maybe key/value safety / validations
  public updateConfig(config: Config): void  {
    this.data.config = config;

    this.saveData({
      dataType: 'settings',
      changeType: 'changed'
    });
  }

  public updatePartialConfig(config: Partial<Config>): void  {
    this.data.config = Object.assign({}, this.data.config, config);

    this.saveData({
      dataType: 'settings',
      changeType: 'changed'
    });
  }

  public updateMediaFolder (newFolder: string): void  {
    this.data.config = this.data.config || {};
    this.data.config.mediaFolder = newFolder;

    this.saveData({
      dataType: 'settings',
      changeType: 'changed'
    });
  }

  public updateObsConfig(newObsConfig: ObsConfig): void  {
    this.data.config = this.data.config || {};

    let obsConfig = this.data.config.obs;

    if (!obsConfig) {
      obsConfig = this.data.config.obs = {
        hostname: '',
        password: null
      };
    }

    obsConfig.hostname = newObsConfig.hostname;
    if (newObsConfig.password && newObsConfig.password !== TOKEN_EXISTS_MARKER) {
      obsConfig.password = newObsConfig.password;
    }

    this.saveData({
      dataType: 'obs-settings',
      changeType: 'changed'
    });
  }


  public updateTwitchConfig(newTwitchConfig: TwitchConfig): void  {
    this.data.config = this.data.config || {};

    const twitchConfig = this.data.config.twitch;

    twitchConfig.enableLog = newTwitchConfig.enableLog;
    twitchConfig.channel = newTwitchConfig.channel;
    if (typeof newTwitchConfig.token !== 'undefined'
      && newTwitchConfig.token !== TOKEN_EXISTS_MARKER) {
      twitchConfig.token = newTwitchConfig.token;
    }
    twitchConfig.customScopes = newTwitchConfig.customScopes ?? [];

    // fill empty bot object
    if (!twitchConfig.bot) {
      twitchConfig.bot = {
        enabled: false,
        response: '',
        command: '!commands',
        auth: {
          name: '',
          token: ''
        }
      }
    }

    // fill empty bot object
    if (!twitchConfig.bot.auth) {
      twitchConfig.bot.auth = {
        name: '',
        token: ''
      }
    }

    twitchConfig.bot.enabled = newTwitchConfig.bot.enabled;
    twitchConfig.bot.response = newTwitchConfig.bot.response;
    twitchConfig.bot.command = newTwitchConfig.bot.command;
    twitchConfig.bot.auth.name = newTwitchConfig.bot.auth.name;

    if (typeof newTwitchConfig.bot.auth.token !== 'undefined'
      && newTwitchConfig.bot.auth.token !== TOKEN_EXISTS_MARKER) {
      twitchConfig.bot.auth.token = newTwitchConfig.bot.auth.token;
    }

    this.saveData({
      dataType: 'twitch-setting',
      changeType: 'changed'
    });
  }

  public updateCustomPort (newPort: number): void  {
    this.data.config = this.data.config || {};

    this.data.config.customPort = newPort;

    this.saveData({
      dataType: 'settings',
      changeType: 'changed'
    });
  }

  public getConfig(replaceTokens = true): Config {
    const mediaFolder = CLI_OPTIONS.MEDIA_PATH ?? this.data.config.mediaFolder;

    const twitchConfig = cloneDeep(this.data.config.twitch);
    if (replaceTokens && twitchConfig.token) {
      twitchConfig.token = TOKEN_EXISTS_MARKER;
    }

    if (replaceTokens && twitchConfig.bot?.auth?.token) {
      twitchConfig.bot.auth.token = TOKEN_EXISTS_MARKER;
    }

    const obsConfig = (cloneDeep(this.data.config.obs) || {}) as ObsConfig;

    if (replaceTokens && obsConfig.password) {
      obsConfig.password = TOKEN_EXISTS_MARKER;
    }


    return {
      ...this.data.config,
      twitch: twitchConfig,
      mediaFolder,
      obs: obsConfig
    };
  }

  public cleanUpConfigs(): void  {
    this.data.clips = {};
    this.data.tags = {};
    this.data.screen = {};
    this.data.twitchEvents = {};

    this.saveData({
      dataType: 'everything',
      changeType: 'removed'
    });

    this._hardRefresh$.next();
  }

  public addAllClipsToScreen(screenId: string, clipList: Partial<Action>[]): void  {
    // add all clips to state
    // assign all clips to screen
    clipList.forEach(clip => {
      operations.addAction(this.data, clip, true);

      this.logger.info('Added clip', clip.id, clip.name);

      operations.addOrUpdateScreenClip(this.data, screenId, {
        id: clip.id,
        visibility: VisibilityEnum.Play,
        position: PositionEnum.FullScreen,
        animationIn: 'random',
        animationOut: 'random'
      });

      this.logger.info('Add Action to screen', clip.id, screenId);
    });

    this.saveData({
      dataType: 'screen-action-config',
      changeType: 'changed',
      id: screenId
    });
  }

  /*
  *  Helpers
  */

  private saveData(changed: ChangedInfo) {
    this.updated$.next(changed);
  }
}

// Once its a bit refactored, this should be used
export const PERSISTENCE: {
  instance: Persistence;
} = {
  instance: null
}

export const PersistenceInstance = new Persistence(
  path.join(NEW_CONFIG_PATH, 'settings', 'settings.json')
);

// todo refactor it to a new place when the new logger is being used
LOGGER.info({CLI_OPTIONS, LOG_PATH, NEW_CONFIG_PATH});

PERSISTENCE.instance = PersistenceInstance;


// TODO Check if possible to use the default @Service()
// Registry for TsED
registerProvider({
  provide: PERSISTENCE_DI,
  useValue: PersistenceInstance
});
