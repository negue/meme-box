import {HasClipId, HasExtendedData, HasId, HasRecipe, HasTargetScreenId} from "./types";

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

  active: boolean;
  label: string; // user filled value

  argumentValues: Record<string, unknown>;
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

export interface TriggerBase
  extends HasId, HasClipId, HasTargetScreenId, HasExtendedData {

}


// TODO split TwitchTrigger as an union type so that not all properties are available everywhere
