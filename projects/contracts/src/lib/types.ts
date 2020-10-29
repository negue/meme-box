import {ChatUserstate} from "tmi.js";
import {MediaType} from "./media.types";

export interface HasId {
  id: string;
}

export interface Dictionary<T> {
  [key: string]: T
}

export enum MetaTriggerTypes {
  Random,
  All,
  AllDelay
}

// (Media) Clip
export interface Clip extends HasId {
  name: string;
  previewUrl?: string;
  volumeSetting?: number; //  XX / 100 in percent
  clipLength?: number; // optional,ms , simple images / gif dont have any length
  playLength: number; // ms, time to play of this clip
  path: string;
  type: MediaType;

  tags?: string[];  // All normal Media-Types can use that to be "tagged"
                    // the Meta Type will use that to trigger all clips of that tagId

  metaType?: MetaTriggerTypes;
  metaDelay?: number; // in ms

  showOnMobile?: boolean;
}

export interface Screen  extends HasId {
  name: string;
  /**
   * Key: clip.id == screenClip.id
   */
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

  zIndex?: number;

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

  roles: string[]; // maybe enum

  // !magic
  // TODO other options per type
}

export interface Tag extends HasId {
  name: string;
  color: string;
}

/**
 * Settings.json - State
 */
export interface SettingsState {
  clips: Dictionary<Clip>;
  twitchEvents: Dictionary<Twitch>;
  screen: Dictionary<Screen>;
  tags: Dictionary<Tag>;

  config:  Partial<Config>;
}

export interface AppState extends SettingsState {
  currentMediaFiles: FileInfo[];
  offlineMode: boolean;
}

export interface Config {
  mediaFolder:   string;
  twitchChannel: string;
  twitchLog?: boolean;
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

export enum TargetScreenType {
  OneScreen,
  ScreenPerType
}

export interface FileResult {
 fullPath: string;
 ext: string;
 fileName: string;
 apiUrl: string;
 fileType: MediaType
}

export interface FileResult {
  fullPath: string;
  ext: string;
  fileName: string;
  apiUrl: string;
  fileType: MediaType
}
