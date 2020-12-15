import * as fs from 'fs';
import {
  Clip,
  Config,
  ConfigV0,
  PositionEnum,
  Screen,
  ScreenClip,
  SettingsState,
  Tag,
  TimedClip,
  Twitch,
  TwitchBotConfig,
  TwitchConfig,
  VisibilityEnum
} from '../projects/contracts/src/lib/types';
import {createInitialState} from "../projects/contracts/src/lib/createInitialState";
import {Observable, Subject} from "rxjs";
import * as path from "path";
import {simpleDateString} from "../projects/utils/src/lib/simple-date-string";
import {createDirIfNotExists, LOG_PATH, NEW_CONFIG_PATH} from "./path.utils";
import {uuidv4} from "../projects/utils/src/lib/uuid";
import {deleteInArray, deleteItemInDictionary, updateItemInDictionary} from "../projects/utils/src/lib/utils";
import {operations} from '../projects/state/src/public-api';
import {debounceTime} from "rxjs/operators";
import {LOGGER} from "./logger.utils";
import {sortClips} from "../projects/utils/src/lib/sort-clips";
// Todo ts-config paths!!!

// TODO Extract more state operations to shared library and from app

let fileBackupToday = false;

export class Persistence {

  private version = 1;

  private updated$ = new Subject();
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

      if (!fileBackupToday) {
        const targetDir = path.dirname(this.filePath);
        const targetFileName = path.basename(this.filePath);

        const backupPathFile = `${targetDir}/backups/${targetFileName}.${simpleDateString()}.backup`;

        saveFile(backupPathFile, data);

        fileBackupToday = true;
      }

      let dataFromFile = {};

      if (data && data.includes('{')) {
        dataFromFile = JSON.parse(data);
      }
      // execute upgrade , changing names or other stuff

      this.data = Object.assign({}, createInitialState(), this.upgradeConfigFile(dataFromFile as any));
      this.updated$.next();
    });

    this.updated$.pipe(
      debounceTime(2000)
    ).subscribe(() => {
      this.logger.info('Data saved!');
      saveFile(this.filePath, this.data, true);
    });
  }



  public upgradeConfigFile(configFromFile: SettingsState): SettingsState {

    if (!configFromFile.version) {
      // new twitch config state
      const configV0 = configFromFile.config as ConfigV0;

      if (configV0) {
        configFromFile.config.twitch = {
          channel: configV0.twitchChannel,
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

  public dataUpdated$ () : Observable<any> {
    return this.updated$.asObservable();
  }

  public hardRefresh$ () : Observable<any> {
    return this._hardRefresh$.asObservable();
  }


  public fullState() {
    return  this.data;
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

    updateItemInDictionary(this.data.screen[targetUrlId].clips, screenClip);

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

    this.saveData();
  }

  public updateMediaFolder (newFolder: string) {
    this.data.config = this.data.config || {};
    this.data.config.mediaFolder = newFolder;

    this.saveData();
  }


  public updateTwitchChannel (channel: string) {
    this.data.config = this.data.config || {};
    this.data.config.twitch.channel  = channel;

    this.saveData();
  }

  public updateTwitchLog (enabled: boolean) {
    this.data.config = this.data.config || {};
    this.data.config.twitch.enableLog = enabled;

    this.saveData();
  }

  public updateTwitchBotIntegration (twitchBotConfig: TwitchBotConfig) {
    this.data.config = this.data.config || {};

    if(!this.data.config.twitch.bot) {
      this.data.config.twitch.bot = {
        enabled: twitchBotConfig.enabled,
        response: twitchBotConfig.response,
      };
    }

    this.data.config.twitch.bot.enabled = twitchBotConfig.enabled;
    this.saveData();
  }

  public updateTwitchBot (twitchConfig: TwitchConfig) {
    console.log(twitchConfig);
    this.data.config = this.data.config || {};
    twitchConfig.channel = this.data.config.twitch.channel || "";
    twitchConfig.bot.enabled = this.data.config.twitch.bot.enabled || false;
    //twitchConfig.bot.response = this.data.config.twitch.bot.response || "";
    this.data.config.twitch = twitchConfig;
    this.saveData();
  }

  public getConfig() {
    return this.data.config;
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

      operations.addScreenClip(this.data, screenId, {
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

LOGGER.info({NEW_CONFIG_PATH, LOG_PATH});

export const PersistenceInstance = new Persistence(path.join(NEW_CONFIG_PATH, 'settings', 'settings.json'));

PERSISTENCE.instance = PersistenceInstance;
