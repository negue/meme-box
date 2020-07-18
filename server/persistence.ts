import * as fs from 'fs';
import {Clip, Config, Dictionary, HasId, ObsClip, ObsURL, State, Twitch} from "../projects/contracts/src/lib/types";
import {createInitialState} from "../projects/contracts/src/lib/createInitialState";
import {Observable, Subject} from "rxjs";
import * as path from "path";


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const initialObsUrlObj: ObsURL = Object.freeze({
  id: '',
  name: '',
  clips: {}
});

export class Persistence {

  private updated$ = new Subject();
  private data: State = Object.assign({}, createInitialState());

  constructor(private filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    // Read the file
    fs.readFile(filePath, {
      encoding: 'utf8',
      flag: 'a+' // open or create if not exist
    }, (err, data) => {
      if (err) {
        return console.log(err);
      }
      console.info('SETTING DATA', data);

      let dataFromFile = {};

      if (data && data.includes('{')) {
        dataFromFile = JSON.parse(data);
      }

      this.data = Object.assign({}, createInitialState(), dataFromFile);

      console.info({data: this.data});
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

    this.saveData();
  }

  public listClips(): Clip[] {
    return Object.values(this.data.clips);
  }

  /*
   *  OBS URLs Settings
   */

  public addObsUrl(obsUrl: ObsURL) {
    console.info({obsUrl});

    obsUrl.id = uuidv4();
    this.data.obsUrls[obsUrl.id] = Object.assign({}, initialObsUrlObj, obsUrl);

    this.saveData();
    return obsUrl.id;
  }

  public updateObsUrl(id: string, obsUrl: ObsURL) {
    console.info({obsUrl});

    obsUrl.id = id;

    this.updateItemInDictionary(this.data.obsUrls, obsUrl);

    this.saveData();
    return obsUrl;
  }

  public deleteObsUrl(id: string) {
    console.info({ prevObsUrl: this.data.obsUrls, id});

    this.deleteItemInDictionary(this.data.obsUrls, id);

    console.info({ postObsUrl: this.data.obsUrls, id});

    this.saveData();
  }


  /*
   *  OBS URLs Settings
   */

  public addObsClip(targetUrlId: string, obsClip: ObsClip) {

    obsClip.id = uuidv4();
    this.data.obsUrls[targetUrlId].clips[obsClip.id] = obsClip;

    this.saveData();
    return obsClip.id;
  }

  public updateObsClip(targetUrlId: string, id: string, obsClip: ObsClip) {
    console.info({obsUrl: obsClip});

    obsClip.id = id;

    this.updateItemInDictionary(this.data.obsUrls[targetUrlId].clips, obsClip);

    this.saveData();
    return obsClip;
  }

  public deleteObsClip(targetUrlId: string, id: string) {
    this.deleteItemInDictionary(this.data.obsUrls[targetUrlId].clips, id);

    this.saveData();
  }

  public listObsUrls(): ObsURL[] {
    return Object.values(this.data.obsUrls);
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
    fs.writeFile(this.filePath, JSON.stringify(this.data, null, '  '), err => {
      console.error(err);
    });
    this.updated$.next();
  }
}
