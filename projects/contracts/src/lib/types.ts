import {ChatUserstate} from "tmi.js";

export enum MediaType {
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,
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
  customCss?: string;
}

export enum PositionEnum {
  FullScreen,
  Absolute,
  // others...
}

export enum VisibilityEnum {
  Play = 0,
  Static,
  Toggle
}

export enum HideAfterType {
  Playing,
  Milliseconds,
  Repeats // maybe?
}

export interface ScreenClip extends HasId  {
  visibility: VisibilityEnum;
  loop?: boolean;

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

  animationIn?: string|null;
  animationOut?: string|null;

  customCss?: string;
}

export interface ScreenViewEntry extends Screen {
  url: string;
}

// TODO refactor, maybe all messages
// and then like "yes, but this one only with bits.."
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
  // screenId:      string; // TODO
  clipId:     string;
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  active: boolean;
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
  offlineMode: boolean;
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

export interface TwitchTriggerCommand {
  message: string;
  command?: Twitch; // Config-Object
  tags?: ChatUserstate;
}
