import * as fs from 'fs';
import {Clip, Config, Screen, ScreenClip, SettingsState, Tag, Twitch} from "../projects/contracts/src/lib/types";
import {createInitialState} from "../projects/contracts/src/lib/createInitialState";
import {Observable, Subject} from "rxjs";
import * as path from "path";
import {simpleDateString} from "../projects/utils/src/lib/simple-date-string";
import {createDirIfNotExists} from "./path.utils";
import {uuidv4} from "../projects/utils/src/lib/uuid";
import {deleteInArray, deleteItemInDictionary, updateItemInDictionary} from "../projects/utils/src/lib/utils";
import {deleteClip} from '../projects/state/src/public-api';
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
  }

  public dataUpdated$ () : Observable<any> {
    return this.updated$.asObservable();
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
    console.info({clip});

    clip.id = uuidv4();
    this.data.clips[clip.id] = clip;

    console.info(this.data.clips);

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
    deleteClip(this.data, id);

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

  public addScreen(screen: Screen) {

    screen.id = uuidv4();
    this.data.screen[screen.id] = Object.assign({}, initialScreenObj, screen);

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

  public addScreenClip(targetUrlId: string, obsClip: ScreenClip) {

    obsClip.id = uuidv4();
    this.data.screen[targetUrlId].clips[obsClip.id] = obsClip;

    this.saveData();
    return obsClip.id;
  }

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

  /*
  *  Helpers
  */

  private saveData() {
    saveFile(this.filePath, this.data, true);
    this.updated$.next();
  }
}

// todo extract ?
function saveFile(filePath: string, data: any, stringify: boolean = false) {
  const getDirOfPath = path.dirname(filePath);

  createDirIfNotExists(getDirOfPath);

  fs.writeFile(filePath, stringify ? JSON.stringify(data, null, '  ') : data, err => {
    if (err) {
      console.error(`Error on Saving File: ${filePath}`, err);
    }
  });
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
