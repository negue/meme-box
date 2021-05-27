import {ChatUserstate} from "tmi.js";
import {MediaType} from "./media.types";

export interface HasId {
  id: string;
}

export interface HasClipId {
  clipId: string;
}


export interface HasTargetScreenId {
  screenId?: string;
}

export interface Dictionary<T> {
  [key: string]: T
}

export enum MetaTriggerTypes {
  Random,
  All,
  AllDelay
}

// TODO RENAME? (Media) Clip
export interface Clip extends HasId {
  name: string;
  previewUrl?: string;   // TODO generate dataurl as preview
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

  extended?: Dictionary<string>; // only used for HTML - Type

  fromTemplate?: string; // GUID / Clip.Id of the Template
}


export interface Screen extends HasId {
  name: string;
  /**
   * Key: clip.id == screenClip.id
   */
  clips: Dictionary<ScreenClip>;
  customCss?: string;

  height: number;
  width: number;
}

export enum PositionEnum {
  FullScreen,
  Absolute,
  Centered,
  Random
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

export interface ScreenClip extends HasId {
  visibility: VisibilityEnum;
  loop?: boolean;

  // later some other settings like position and stuff
  width?: string; // 60%, 720px
  height?: string;

  // todo extract position to its own object
  position?: PositionEnum;
  left?: string;
  right?: string;
  bottom?: string;
  top?: string;
  transform?: string;
  imgFit?: string;

  hideAfter?: HideAfterType;
  hideAfterValue?: any;

  animationIn?: string | null;
  animationOut?: string | null;

  animationInDuration?: number,
  animationOutDuration?: number,

  zIndex?: number;

  customCss?: string;

  arrangeLock?: {
    size: boolean;
    position: boolean;
    transform: boolean;
  }
}

export interface ScreenViewEntry extends Screen {
  url: string;
}

export enum TwitchEventTypes {
  message = 'message',
  sub = 'sub',
  bits = 'bits',
  raid = 'raid',
  host = 'host',
  channelPoints = 'channelPoints'
}

export interface TimedClip extends HasId, HasClipId, HasTargetScreenId {
  // id => has nothing to do with clipID
  everyXms: number;
  active: boolean;
}

export interface Twitch extends HasId, HasClipId, HasTargetScreenId {
  name: string;
  // screenId:      string; // TODO
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  active: boolean;

  roles: string[]; // maybe enum
  minAmount?: number;
  maxAmount?: number;

  cooldown?: number;

  // !magic
  // TODO other options per type
}

export interface Tag extends HasId {
  name: string;
  color: string;
}

/**
 * Settings.json - State
 *
 * Persistent State
 */
export interface SettingsState {
  version: number;
  clips: Dictionary<Clip>;
  twitchEvents: Dictionary<Twitch>;
  timers: Dictionary<TimedClip>;
  screen: Dictionary<Screen>;
  tags: Dictionary<Tag>;

  config: Partial<Config>;
}

export interface UpdateState {
  available: boolean,
  version: string;
}

export interface ServerState {
  update: UpdateState;
}

export interface AppState extends SettingsState {
  currentMediaFiles: FileInfo[];
  offlineMode: boolean;
  update: UpdateState;
}

export interface Config {
  customPort?: number | null;
  mediaFolder: string;
  twitch: TwitchConfig;
  enableVersionCheck?: boolean;
}

export interface TwitchConfig {
  channel: string;
  enableLog?: boolean;
  bot?: TwitchBotConfig
}

export interface TwitchBotConfig {
  enabled: boolean;
  response: string,
  auth?: {
    name: string;
    token: string;
  }
}

export interface ConfigV0 {
  mediaFolder: string;
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

export interface CombinedClip {
  clip: Clip;
  clipSetting: ScreenClip;
  backgroundColor?: string;
}
