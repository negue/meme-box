import {ChatUserstate} from "tmi.js";
import {MediaType} from "./media.types";
import {TriggerAction} from "./actions";
import {AllTwitchEvents} from "../../../../server/providers/twitch/twitch.connector.types";

// TODO MERGE / IMPROVE THESE TYPE IMPORTS..

export interface HasId {
  id: string;
}

export interface HasClipId {
  clipId: string;
}


export interface HasTargetScreenId {
  screenId?: string;
}

// TODO replace by Record<TKey, TValue>
export interface Dictionary<T> extends Record<string, T> { }

export enum MetaTriggerTypes {
  Random,
  All,
  AllDelay
}

export interface ActionOverridableProperies {
  // Empty for now
}

export interface HasExtendedData {
  // used for Widgets and/or variables / -config
  extended?: Dictionary<string>;
}

// TODO RENAME? (Media) Clip -- new name ACTIONS
// - because media is visible and actions are just the scripts and stuff
export interface Clip extends HasId, ActionOverridableProperies, HasExtendedData {
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

export interface ScreenMediaOverridableProperties {
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

  animationIn?: string | null;
  animationOut?: string | null;

  animationInDuration?: number,
  animationOutDuration?: number,

  zIndex?: number;

  customCss?: string;
}

export interface ScreenClip extends HasId, ScreenMediaOverridableProperties {
  hideAfter?: HideAfterType;
  hideAfterValue?: any;

  // settings view only
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
  follow = 'follow',
  bits = 'bits',
  raid = 'raid',
  host = 'host',
  channelPoints = 'channelPoints',
  ban = 'ban',
  subscription = "subscription",
  gift = "gift"
}

export interface TwitchEventFields {
  [event:string]: {
    fields: {
      minValue?: { enable: boolean, placeholder?: string},
      maxValue?: { enable: boolean, placeholder?: string},
      channelPointId?: { enable: boolean }
    }
  }
}

export interface TriggerBase
  extends HasId, HasClipId, HasTargetScreenId, HasExtendedData {

}

// TODO RENAME TimedClip / Twitch so that those are recognized to be a trigger

export interface TimedClip extends TriggerBase {
  // id => has nothing to do with clipID
  everyXms: number;
  active: boolean;
}

export interface Twitch extends TriggerBase {
  name: string;
  // screenId:      string; // TODO
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  active: boolean;

  roles: string[]; // maybe enum
  minAmount?: number;
  maxAmount?: number;

  cooldown?: number;

  channelPointId?: string;

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
  obs: ObsConfig;
}

export interface TwitchConfig {
  channel: string;
  enableLog?: boolean;
  bot?: TwitchBotConfig;
  token: string;
}

export interface ObsConfig {
  hostname: string;
  password?: string;
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
  twitchEvent?: AllTwitchEvents
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
  originalClipSetting?: ScreenClip;
  triggerPayload?: TriggerAction;
  backgroundColor?: string;
}

export interface Response {
  ok: boolean;
  id?: string;
}
