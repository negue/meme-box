import {HasClipId, HasExtendedData, HasId, HasRecipe, HasTargetScreenId} from "./types";
import {AllTwitchEvents, DefaultImage} from "@memebox/contracts";
import {ChatUserstate} from "tmi.js";

// Some kind of list of possible trigger types you can use
// Triggers -> using one of these trigger Types

// TriggerTypeGroup => Names for possible Languags (en, de etc), fixed key
// TriggerType => per Group and Type + Description of what it does and what kind of config/settings this TriggerConfig
// TriggerConfig => Listed in UI as "Trigger", Generic Config + TriggerType Settings + Recipe



export interface ConfigArgument<TDefault> {
  name: string;

  // key i18n codes
  labels: Record<string, string>;

  default?: TDefault;
  required?: boolean;
}

export interface ConfigBooleanArgument extends ConfigArgument<boolean> {
  type: 'boolean';
}

export interface ConfigTextArgument extends ConfigArgument<string> {
  type: 'text';
  placeholder?: string;
  suffix?: string;
}

export interface ConfigMultipleTextArgument extends ConfigArgument<string[]> {
  type: 'multipleText';
  displayAs: {
    chipInput: boolean;
  }
}


export interface ConfigTextareaArgument extends ConfigArgument<string> {
  type: 'textarea';
}

export interface ConfigNumberArgument extends ConfigArgument<number> {
  type: 'number';
  placeholder?: string;
  suffix?: string;
}

export interface ConfigSelectionEntry {
  id: string;
  // key i18n codes
  labels: Record<string, string>;
}

export interface ConfigSelectionSingleArgument extends ConfigArgument<string> {
  type: 'selectionSingle';
  getEntries(): Promise<ConfigSelectionEntry[]>;
}

export interface ConfigSelectionMultipleArgument extends ConfigArgument<string[]> {
  type: 'selectionMultiple';
  getEntries(): Promise<ConfigSelectionEntry[]>;
  displayAs: {
    checkboxes: boolean;
  }
}

export type ConfigArguments =
  | ConfigBooleanArgument
  | ConfigTextArgument
  | ConfigMultipleTextArgument
  | ConfigTextareaArgument
  | ConfigNumberArgument
  | ConfigSelectionSingleArgument
  | ConfigSelectionMultipleArgument

export interface TriggerType {
  type: string;  // example twitch.sub, needs to be unique
  groupKey: string; // example Twitch

  // key i18n codes
  labels: Record<string, string>;

  arguments: ConfigArguments[];
}

export interface TriggerConfig
  extends HasId, HasRecipe
{
  type: string;

  label: string; // user filled value

  argumentValues: Record<ConfigArguments['type'], unknown>;
}

export interface TriggerTypeGroup {
  key: string;
  // key i18n codes
  labels: Record<string, string>;

  // generic arguments between all types of this group
  arguments: ConfigArguments[];
}

class TriggerTypeRegistrationClass {
  private groups: TriggerTypeGroup[] = [];
  private types: TriggerType[] = [];

  public addTriggerGroup(tg: TriggerTypeGroup) {
    if (this.groups.some(g => g.key === tg.key)){
      throw new Error(`Type Group ${tg.key} already exist`);
    }

    this.groups.push(tg);
  }

  public addTriggerType(tt: TriggerType) {
    if (!this.groups.some(g => g.key === tt.groupKey)){
      throw new Error(`Type Group ${tt.groupKey} doesn't exist`);
    }

    if (this.types.some(g => g.type === tt.type)){
      throw new Error(`Type ${tt.type} already exist`);
    }

    this.types.push(tt);
  }
}

export const TriggerTypeRegistration = new TriggerTypeRegistrationClass();

export interface TwitchTriggerCommand {
  command?: TwitchTrigger; // Config-Object
  tags?: ChatUserstate;
  twitchEvent?: AllTwitchEvents
}

export interface TwitchTriggerChannelPointData {
  id: string;
  image?: null;
  background_color: string;
  cost: number;
  title: string;
  default_image: DefaultImage;
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

// TODO split TwitchTrigger as an union type so that not all properties are available everywhere

export interface TwitchTrigger extends Omit<TriggerBase, 'clipId'>, HasRecipe {
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

export const TwitchTypesArray = [
  // TwitchEventTypes.follow,
  TwitchEventTypes.bits,
  TwitchEventTypes.channelPoints,
  // TwitchEventTypes.host,
  TwitchEventTypes.message,
  TwitchEventTypes.raid,
  TwitchEventTypes.ban,
  TwitchEventTypes.subscription,
  TwitchEventTypes.gift
];
