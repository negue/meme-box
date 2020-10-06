import * as fs from 'fs';
import {
  Clip,
  Config,
  PositionEnum,
  Screen,
  ScreenClip,
  SettingsState,
  Tag,
  Twitch,
  VisibilityEnum
} from "../projects/contracts/src/lib/types";
import {createInitialState} from "../projects/contracts/src/lib/createInitialState";
import {Observable, Subject} from "rxjs";
import * as path from "path";
import {simpleDateString} from "../projects/utils/src/lib/simple-date-string";
import {createDirIfNotExists} from "./path.utils";
import {uuidv4} from "../projects/utils/src/lib/uuid";
import {deleteInArray, deleteItemInDictionary, updateItemInDictionary} from "../projects/utils/src/lib/utils";
import {operations} from '../projects/state/src/public-api';
import {debounceTime} from "rxjs/operators";
// Todo ts-config paths!!!

// TODO Extract more state operations to shared library and from app

const initialScreenObj: Screen = Object.freeze({
  id: '',
  name: '',
  clips: {}
});

let fileBackupToday = false;

export class Persistence {

  private updated$ = new Subject();
  private _hardRefresh$ = new Subject();
  private data: SettingsState = Object.assign({}, createInitialState());

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

      this.data = Object.assign({}, createInitialState(), dataFromFile);
      this.updated$.next();
    });

    this.updated$.pipe(
      debounceTime(2000)
    ).subscribe(() => {
      console.log('Data saved!');
      saveFile(this.filePath, this.data, true);
    });
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
    console.info({clip});

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
    return Object.values(this.data.clips);
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
   *  General Settings
   */

  // TODO maybe key/value safety / validations
  public updateConfig(config: Config) {
    this.data.config = config;

    this.saveData();
  }

  public updateMediaFolder (newFolder: string) {
    console.info({newFolder});
    this.data.config = this.data.config || {};
    this.data.config.mediaFolder = newFolder;

    this.saveData();
  }


  public updateTwitchChannel (channel: string) {
    this.data.config = this.data.config || {};
    this.data.config.twitchChannel  = channel;

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
    console.info('addAllClipsToScreen', {
      screenId,
      clipLength: clipList.length
    });

    const currentScreen = this.data.screen[screenId];

    const prevJson = JSON.stringify(currentScreen);

    // add all clips to state
    // assign all clips to screen
    clipList.forEach(clip => {
      operations.addClip(this.data, clip, true);

      console.info('Added clip', clip.id, clip.name);

      operations.addScreenClip(this.data, screenId, {
        id: clip.id,
        visibility: VisibilityEnum.Play,
        position: PositionEnum.FullScreen,
        animationIn: 'random',
        animationOut: 'random'
      });

      console.info('Add Clip to screen', clip.id, screenId);
    });


    const nextJson = JSON.stringify(currentScreen);
    console.warn({ screenId, prevJson, nextJson });

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
function saveFile(filePath: string, data: any, stringify: boolean = false) {
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


// Get the config path (for the settings.json)
const configPathArgument = process.argv.find(arg => arg.includes('--config'));

// Gets the correct User-AppData Folder
const userDataFolder = process.env.APPDATA ||
  (process.platform == 'darwin'
    ? `${process.env.HOME}/Library/Preferences`
    : `${process.env.HOME}/.local/share`)
;

export const NEW_CONFIG_PATH = configPathArgument
  ? configPathArgument.replace('--config=', '')
  : path.join(userDataFolder, 'meme-box');

createDirIfNotExists(NEW_CONFIG_PATH);

console.log({NEW_CONFIG_PATH});


export const PersistenceInstance = new Persistence(path.join(NEW_CONFIG_PATH, 'settings', 'settings.json'));
PERSISTENCE.instance = PersistenceInstance;
