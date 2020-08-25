import * as fs from 'fs';
import {
  Clip,
  Config,
  Dictionary,
  HasId,
  Screen,
  ScreenClip,
  SettingsState,
  Twitch
} from "../projects/contracts/src/lib/types";
import {createInitialState} from "../projects/contracts/src/lib/createInitialState";
import {Observable, Subject} from "rxjs";
import * as path from "path";


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const initialScreenObj: Screen = Object.freeze({
  id: '',
  name: '',
  clips: {}
});

let fileBackupToday = false;

function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

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

        const backupPathFile = `${targetDir}/backups/${targetFileName}.${fileDateGenerator()}.backup`;

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
    this.updateItemInDictionary(this.data.clips, clip);

    this.saveData();
    return clip;
  }

  public deleteClip(id: string) {
    this.deleteItemInDictionary(this.data.clips, id);

    const screenKeys = Object.keys(this.data.screen);

    for (const screenKey of screenKeys) {
      const screen = this.data.screen[screenKey];

      this.deleteItemInDictionary(screen.clips, id);
    }

    this.saveData();
  }

  public listClips(): Clip[] {
    return Object.values(this.data.clips);
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

    this.updateItemInDictionary(this.data.screen, screen);

    this.saveData();
    return screen;
  }

  public deleteScreen(id: string) {
    this.deleteItemInDictionary(this.data.screen, id);

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

    this.updateItemInDictionary(this.data.screen[targetUrlId].clips, screenClip);

    this.saveData();
    return screenClip;
  }

  public deleteScreenClip(targetUrlId: string, id: string) {
    this.deleteItemInDictionary(this.data.screen[targetUrlId].clips, id);

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

    this.updateItemInDictionary(this.data.twitchEvents, twitchEvent);

    this.saveData();
    return twitchEvent;
  }

  public deleteTwitchEvent(id: string) {
    this.deleteItemInDictionary(this.data.twitchEvents, id);

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

  private updateItemInDictionary<T extends HasId>(dict: Dictionary<T>, item: T) {
    dict[item.id] = item;
  }

  private deleteItemInDictionary<T extends HasId>(dict: Dictionary<T>, id: string) {
    delete dict[id];
  }

  private saveData() {
    saveFile(this.filePath, this.data, true);
    this.updated$.next();
  }
}

function saveFile(filePath: string, data: any, stringify: boolean = false) {
  const getDirOfPath = path.dirname(filePath);

  createDirIfNotExists(getDirOfPath);

  fs.writeFile(filePath, stringify ? JSON.stringify(data, null, '  ') : data, err => {
    if (err) {
      console.error(`Error on Saving File: ${filePath}`, err);
    }
  });
}

function fileDateGenerator() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  // YYYY_MM_DD_HH_MM_SS
  const newDateString = `${year}_${month}_${day}__${hour}_${minute}_${second}`;

  return newDateString;
}

export const PersistenceInstance = new Persistence('./settings/settings.json');
