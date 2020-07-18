export const enum MediaType {
  Picture,
  Audio,
  Video
}

export interface HasId {
  id: string;
}

export interface Dictionary<T> {
  [key: string]: T
}

export interface Clip extends HasId {
  name: string;
  previewUrl: string;
  volumeSetting: number; //  XX / 100 in percent
  clipLength?: number; // optional,ms , simple images / gif dont have any length
  playLength: number; // ms, time to play of this clip
  path: string;
  obsName: string; // TODO refactor once state management is available to a GUID
  type: MediaType;
}

export interface Screen  extends HasId {
  name: string;
  clips: Dictionary<ScreenClip>;
}

export interface ScreenClip extends HasId  {
  // later some other settings like position and stuff
}

export interface ScreenViewEntry extends Screen {
  url: string;
}

export interface Twitch extends HasId {
  screenId:      string; // TODO
  clipId:     string;
  event:    string; // later an enum?
  contains?: string; // additional settings TODO
}

export interface State {
  clips: Dictionary<Clip>;
  twitchEvents: Dictionary<Twitch>;
  screen: Dictionary<Screen>;

  config:  Partial<Config>;
}

export interface Config {
  mediaFolder:   string;
  twitchChannel: string;
}

//TODO: Fix later and forget about the TODO LUL
