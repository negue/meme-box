import {ChatUserstate} from "tmi.js";
import {ActionType} from "./media.types";
import {ActionOverridableProperties, TriggerAction} from "./actions";
import {AllTwitchEvents} from "./twitch.connector.types";
import {DefaultImage} from "./twitch-data.types";
import {RecipeContext} from "@memebox/recipe-core";

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

// TODO CHECK META
export enum MetaTriggerTypes {
  Random,
  All,
  AllDelay
}


export interface HasExtendedData {
  // used for Widgets and/or variables / -config
  extended?: Dictionary<unknown>;
}

export interface Action extends HasId, ActionOverridableProperties, HasExtendedData {
  name: string;
  previewUrl?: string;
  hasPreview?: boolean;
  volumeSetting?: number; //  XX / 100 in percent
  gainSetting?: number; //  XX / 100 in percent
  clipLength?: number; // optional,ms , simple images / gif dont have any length
  playLength?: number; // ms, time to play of this clip
  path?: string;
  isActive?: boolean;

  type: ActionType;

  tags?: string[];  // All normal Media-Types can use that to be "tagged"

  /**
   * @deprecated will be removed in a different version
   */
  metaType?: MetaTriggerTypes;

  /**
   * @deprecated will be removed in a different version
   */
  metaDelay?: number; // in ms

  showOnMobile?: boolean;
  queueName?: string; // Name of a shared queue to be used to "wait" before the action will be triggered


  fromTemplate?: string; // GUID / Clip.Id of the Template
  description?: string;

  recipe?: RecipeContext;
}

export interface Screen extends HasId {
  name: string;
  /**
   * Key: clip.id == screenClip.id
   */
  clips: Dictionary<ScreenMedia>;
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

  /**
   * If you are in a script and currently animation all stuff in "triggerWhile" then you can
   * use this to prevent transition between those settings "updates"
   */
  animating?: boolean;

  animationIn?: string | null;
  animationOut?: string | null;

  animationInDuration?: number,
  animationOutDuration?: number,

  zIndex?: number;

  customCss?: string;
}

export interface ScreenMedia extends HasId, ScreenMediaOverridableProperties {
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

// TODO RENAME TimedAction/ Twitch so that those are recognized to be a trigger

export interface TimedAction extends TriggerBase {
  // id => has nothing to do with clipID
  everyXms: number;
  active: boolean;
}

export interface TwitchTrigger extends TriggerBase {
  name: string;
  // screenId:      string; // TODO
  event: TwitchEventTypes;
  contains?: string; // additional settings TODO
  aliases?: string[];

  active: boolean;

  roles: string[]; // maybe enum
  minAmount?: number;
  maxAmount?: number;

  cooldown?: number;
  canBroadcasterIgnoreCooldown?: boolean;

  channelPointId?: string;

  channelPointData?:TwitchTriggerChannelPointData;

  // !magic
  // TODO other options per type
}

export interface TwitchTriggerChannelPointData {
  id: string;
  image?: null;
  background_color: string;
  cost: number;
  title: string;
  default_image: DefaultImage;
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
  clips: Dictionary<Action>;
  twitchEvents: Dictionary<TwitchTrigger>;
  timers: Dictionary<TimedAction>;
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
  token: string|null;
  customScopes?: string[]|null;
}

export interface ObsConfig {
  hostname: string;
  password?: string;
}


export interface TwitchBotConfig {
  enabled: boolean;
  response: string;
  command: string;
  auth?: {
    name: string;
    token: string | null;
  }
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
  fileType: ActionType;
}

export interface TwitchTriggerCommand {
  command?: TwitchTrigger; // Config-Object
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
  fileType: ActionType
}

export interface CombinedActionContext {
  action: Action;
  screenMediaConfig: ScreenMedia;
  originalClipSetting?: ScreenMedia;
  triggerPayload?: TriggerAction;
  backgroundColor?: string;
}

export interface Response {
  ok: boolean;
  id?: string;
}

export type TwitchConnectionType = "MAIN" | "BOT";

export interface ChangedInfo {
  id?: string;
  targetScreenId?: string;
  dataType: 'everything'|'action'|'tags'|'screens'|'screen-action-config'
    |'settings'|'twitch-events'|'timers'|'twitch-setting';
  actionType?: ActionType;
  changeType: 'added'|'changed'|'removed';
}

export type ScreenState = Record<string, boolean>;

export interface ScreenActiveStatePayload {
  screenId?: string;
  state: boolean;
}

// TODO cleanup / split up types


export interface RegisterServicePayload {
  name: string;
  color?: string;
}

export interface StatePayload {
  label: string;
  description?: string;
  backgroundColor?: string;
  color?: string;
}

export interface StateOfAService extends RegisterServicePayload {
  state: StatePayload;
}

export interface ConnectionState {
  [id: string]: StateOfAService
}

export interface ObsBrowserSourceData {
  messageId: string;
  status: "ok";
  sourceName: string;
  sourceType: string;
  sourceSettings: Record<string, unknown>;
}

export interface ObsSourceEntry {
  name: string;
  typeId: string;
  type: string;
}

export interface ObsSourceFilterEntry {
  enabled: boolean;
  type: string;
  name: string;
  settings: Record<string, unknown>;
}
