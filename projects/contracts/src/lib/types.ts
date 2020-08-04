export enum MediaType {
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
  type: MediaType;
}

export interface Screen  extends HasId {
  name: string;
  clips: Dictionary<ScreenClip>;
}

export enum PositionEnum {
  FullScreen,
  Absolute,
  // others...
}

export enum HideAfterType {
  Playing,
  Milliseconds,
  Repeats // maybe?
}

export interface ScreenClip extends HasId  {
  // later some other settings like position and stuff
  width?: string; // 60%, 720px
  height?: string;

  position?: PositionEnum;
  left?: string;
  right?: string;
  bottom?: string;
  top?: string;
  imgFit?: string;

  hideAfter?: HideAfterType;
  hideAfterValue?: any;
}

export interface ScreenViewEntry extends Screen {
  url: string;
}

export const enum TwitchEventTypes {
  message = 'message',
  follow = 'follow',
  sub = 'sub',
  bits = 'bits',
  raid = 'raid',
  host = 'host',
  channelPoints = 'channelPoints'
}

export interface Twitch extends HasId {
  name: string;
  screenId:      string; // TODO
  clipId:     string;
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  // !magic
  // TODO other options per type
}

/**
 * Settings.json - State
 */
export interface SettingsState {
  clips: Dictionary<Clip>;
  twitchEvents: Dictionary<Twitch>;
  screen: Dictionary<Screen>;

  config:  Partial<Config>;
}

export interface AppState extends SettingsState {
  currentMediaFiles: FileInfo[];
}

export interface Config {
  mediaFolder:   string;
  twitchChannel: string;
}

export interface NetworkInfo {
  ifname: string;
  address: string;
}

//TODO: Fix later and forget about the TODO LUL

export interface FileInfo {
  fullPath: string;
  fileName: string;
  apiUrl: string;
  ext: string;
  fileType: MediaType;
}
