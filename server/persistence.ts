import * as fs from 'fs';
import {
  Clip,
  Config,
  ConfigV0,
  createInitialState,
  ObsConfig,
  PositionEnum,
  Screen,
  ScreenClip,
  SettingsState,
  Tag,
  TimedClip,
  Twitch,
  TwitchConfig,
  VisibilityEnum
} from '@memebox/contracts';
import {Observable, Subject} from "rxjs";
import * as path from "path";
import {
  deleteInArray,
  deleteItemInDictionary,
  simpleDateString,
  sortClips,
  updateItemInDictionary,
  uuidv4
} from "@memebox/utils";
import {createDirIfNotExists, LOG_PATH, NEW_CONFIG_PATH} from "./path.utils";
import {operations} from '../projects/state/src/public-api';
import {debounceTime} from "rxjs/operators";
import {LOGGER} from "./logger.utils";
import {registerProvider} from "@tsed/di";
import {PERSISTENCE_DI} from "./providers/contracts";
import {CLI_OPTIONS} from "./utils/cli-options";
import cloneDeep from 'lodash/cloneDeep';

// TODO Extract more state operations to shared library and from app

let fileBackupToday = false;

export const TOKEN_EXISTS_MARKER = 'TOKEN_EXISTS';

export class Persistence {

  public configLoaded$ = new Subject();

  // This is the CONFIG-Version, not the App Version
  private version = 1;

  private updated$ = new Subject<void>();
  private _hardRefresh$ = new Subject();
  private data: SettingsState = Object.assign({}, createInitialState());

  private logger  = LOGGER.child({ label: 'Persistence' });

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
        return console.log(err);
      }

      let dataFromFile = {};

      if (data && data.includes('{')) {
        dataFromFile = JSON.parse(data);
      }
      // execute upgrade , changing names or other stuff

      this.data = Object.assign({}, createInitialState(), this.upgradeConfigFile(dataFromFile as any));
      this.updated$.next();
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
  public upgradeConfigFile(configFromFile: SettingsState): SettingsState {

    if (!configFromFile.version) {
      // new twitch config state
      const configV0 = configFromFile.config as ConfigV0;

      if (configV0) {
        configFromFile.config.twitch = {
          channel: configV0.twitchChannel,
          token: '',
          enableLog: configV0.twitchLog,
          bot: {
            enabled: false,
            response: ''
          }
        };

        delete configV0.twitchLog;
        delete configV0.twitchChannel;
      }
    }

    configFromFile.version = this.version;

    return configFromFile;
  }

  public dataUpdated$ () : Observable<void> {
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
   *  Clips Persistence
   */

  public addClip(clip: Clip) {
    operations.addClip(this.data, clip, true);

    this.saveData();
    return clip.id;
  }

  public updateClip(id: string, clip: Clip) {
    clip.id = id;
    updateItemInDictionary(this.data.clips, clip);

    this.saveData();
    return clip;
  }

  public deleteClip(id: string) {
    operations.deleteClip(this.data, id);

    this.saveData();
  }

  public listClips(): Clip[] {
    return sortClips(Object.values(this.data.clips));
  }


  /*
   *  Clips Persistence
   */

  public addTag(tag: Tag) {
    tag.id = uuidv4();
    this.data.tags[tag.id] = tag;

    this.saveData();
    return tag.id;
  }

  public updateTag(id: string, tag: Tag) {
    tag.id = id;
    updateItemInDictionary(this.data.tags, tag);

    this.saveData();
    return tag;
  }

  // TODO Extract shared state logic between app/ server
  public deleteTag(id: string) {
    deleteItemInDictionary(this.data.tags, id);

    for(const clip of Object.values(this.data.clips)) {
      if (clip.tags && clip.tags.includes(id)) {
        deleteInArray(clip.tags, id);
      }
    }

    this.saveData();
  }

  public listTags(): Tag[] {
    return Object.values(this.data.tags);
  }


  /*
   *  Screens Persistence
   */

  public addScreen(screen: Partial<Screen>) {
    operations.addScreen(this.data, screen);

    this.saveData();
    return screen.id;
  }

  public updateScreen(id: string, screen: Screen) {
    screen.id = id;

    updateItemInDictionary(this.data.screen, screen);

    this.saveData();
    return screen;
  }

  public deleteScreen(id: string) {
    deleteItemInDictionary(this.data.screen, id);

    this.saveData();
  }

  public listScreens(): Screen[] {
    return Object.values(this.data.screen);
  }

  /*
   *  Screen Clips Settings
   */

  public updateScreenClip(targetUrlId: string, id: string, screenClip: ScreenClip) {
    screenClip.id = id;

    operations.addOrUpdateScreenClip(this.data, targetUrlId, screenClip);

    this.saveData();
    return screenClip;
  }

  public deleteScreenClip(targetUrlId: string, id: string) {
    deleteItemInDictionary(this.data.screen[targetUrlId].clips, id);

    this.saveData();
  }



  /*
   *  Twitch Event Settings
   */

  public addTwitchEvent(twitchEvent: Twitch) {
    twitchEvent.id = uuidv4();
    this.data.twitchEvents[twitchEvent.id] = twitchEvent;

    this.saveData();
    return twitchEvent.id;
  }

  public updateTwitchEvent(id: string, twitchEvent: Twitch) {
    twitchEvent.id = id;

    updateItemInDictionary(this.data.twitchEvents, twitchEvent);

    this.saveData();
    return twitchEvent;
  }

  public deleteTwitchEvent(id: string) {
    deleteItemInDictionary(this.data.twitchEvents, id);

    this.saveData();
  }

  public listTwitchEvents(): Twitch[] {
    return Object.values(this.data.twitchEvents);
  }


  /*
   *  Timed Clips Settings
   */

  public addTimedEvent(timedEvent: TimedClip) {
    timedEvent.id = uuidv4();
    this.data.timers[timedEvent.id] = timedEvent;

    this.saveData();
    return timedEvent.id;
  }

  public updateTimedEvent(id: string, timedEvent: TimedClip) {
    timedEvent.id = id;

    updateItemInDictionary(this.data.timers, timedEvent);

    this.saveData();
    return timedEvent;
  }

  public deleteTimedEvent(id: string) {
    deleteItemInDictionary(this.data.timers, id);

    this.saveData();
  }

  public listTimedEvents(): TimedClip[] {
    return Object.values(this.data.timers);
  }

  /*
   *  General Settings
   */

  // TODO maybe key/value safety / validations
  public updateConfig(config: Config) {
    this.data.config = config;

    this.saveData();
  }

  public updatePartialConfig(config: Partial<Config>) {
    this.data.config = Object.assign({}, this.data.config, config);

    console.info({
      config,
      saved: this.data.config
    });

    this.saveData();
  }

  public updateMediaFolder (newFolder: string) {
    this.data.config = this.data.config || {};
    this.data.config.mediaFolder = newFolder;

    this.saveData();
  }

  public updateObsConfig(newObsConfig: ObsConfig) {
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

    // TODO add "what changed" to saveData
    this.saveData();
  }


  public updateTwitchConfig(newTwitchConfig: TwitchConfig) {
    this.data.config = this.data.config || {};

    const twitchConfig = this.data.config.twitch;

    twitchConfig.enableLog = newTwitchConfig.enableLog;
    twitchConfig.channel  = newTwitchConfig.channel;
    if (newTwitchConfig.token && newTwitchConfig.token !== TOKEN_EXISTS_MARKER) {
      twitchConfig.token = newTwitchConfig.token;
    }

    // fill empty bot object
    if(!twitchConfig.bot) {
      twitchConfig.bot = {
        enabled: false,
        response: '',
        auth: {
          name: '',
          token: ''
        }
      }
    }

      // fill empty bot object
    if(!twitchConfig.bot.auth) {
      twitchConfig.bot.auth = {
        name: '',
        token: ''
      }
    }

    twitchConfig.bot.enabled = newTwitchConfig.bot.enabled;
    twitchConfig.bot.response = newTwitchConfig.bot.response;
    twitchConfig.bot.auth.name = newTwitchConfig.bot.auth.name;

    if (newTwitchConfig.bot.auth.token && newTwitchConfig.bot.auth.token !== TOKEN_EXISTS_MARKER) {
      twitchConfig.bot.auth.token = newTwitchConfig.bot.auth.token;
    }


    console.info({
      twitchConfig,
      saved: this.data.config
    });

    // TODO add "what changed" to saveData
    this.saveData();
  }

  public updateCustomPort (newPort: number) {
    this.data.config = this.data.config || {};

    this.data.config.customPort = newPort;

    this.saveData();
  }

  public getConfig(): Config {
    const mediaFolder = CLI_OPTIONS.MEDIA_PATH ?? this.data.config.mediaFolder;

    const twitchConfig = cloneDeep(this.data.config.twitch);
    if (twitchConfig.token) {
      twitchConfig.token = TOKEN_EXISTS_MARKER;
    }

    if (twitchConfig.bot?.auth?.token) {
      twitchConfig.bot.auth.token = TOKEN_EXISTS_MARKER;
    }

    const obsConfig = (cloneDeep(this.data.config.obs) || {}) as ObsConfig;

    if (obsConfig.password) {
      obsConfig.password = TOKEN_EXISTS_MARKER;
    }


    return {
      ...this.data.config,
      twitch: twitchConfig,
      mediaFolder,
      obs: obsConfig
    };
  }

  public cleanUpConfigs() {
    this.data.clips = {};
    this.data.tags = {};
    this.data.screen = {};
    this.data.twitchEvents = {};

    this.saveData();
    this._hardRefresh$.next();
  }

  public addAllClipsToScreen(screenId: string, clipList: Partial<Clip>[]) {
    const currentScreen = this.data.screen[screenId];

    const prevJson = JSON.stringify(currentScreen);

    // add all clips to state
    // assign all clips to screen
    clipList.forEach(clip => {
      operations.addClip(this.data, clip, true);

      this.logger.info('Added clip', clip.id, clip.name);

      operations.addOrUpdateScreenClip(this.data, screenId, {
        id: clip.id,
        visibility: VisibilityEnum.Play,
        position: PositionEnum.FullScreen,
        animationIn: 'random',
        animationOut: 'random'
      });

      this.logger.info('Add Clip to screen', clip.id, screenId);
    });

    this.saveData();
  }

  /*
  *  Helpers
  */

  private saveData() {
    this.updated$.next();
  }
}

// TODO change to promise / async
// todo extract ?
function saveFile(filePath: string, data: any, stringify = false) {
  const getDirOfPath = path.dirname(filePath);

  createDirIfNotExists(getDirOfPath);

  fs.writeFileSync(filePath, stringify
    ? JSON.stringify(data, null, '  ')
    : data /*, err => {
    if (err) {
      console.error(`Error on Saving File: ${filePath}`, err);
    }
  }*/);
}

// Once its a bit refactored, this should be used
export const PERSISTENCE: {
  instance: Persistence;
} = {
  instance: null
}


export const PersistenceInstance = new Persistence(path.join(NEW_CONFIG_PATH, 'settings', 'settings.json'));

// todo refactor it to a new place when the new logger is being used
LOGGER.info({CLI_OPTIONS, LOG_PATH, NEW_CONFIG_PATH});

PERSISTENCE.instance = PersistenceInstance;


// TODO Check if possible to use the default @Service()
// Registry for TsED
registerProvider({
  provide: PERSISTENCE_DI,
  useValue: PersistenceInstance
});
