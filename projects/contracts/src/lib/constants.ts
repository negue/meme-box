import {TwitchEventTypes} from './types';

// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',
  TAGS: 'tags',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  ERROR: 'error',
  CONFIG: 'config',
  OPEN: 'open',
  STATE: 'state',

  TWITCH_EVENTS: 'twitch_events',
  TIMED_EVENTS: 'timed_events',
  TWITCH_TRIGGER: 'twitch_events/trigger',
  NETWORK_LIST: 'network_ip_list',
}

export const CONFIG_TWITCH = '/twitch';
export const CONFIG_OBS = '/obs';
export const CONFIG_CUSTOM_PORT_PATH = '/customPort';
export const OPEN_CONFIG_PATH = `/config`;
export const OPEN_FILES_PATH = `/files`;

export const TwitchTypesArray = [
  // TwitchEventTypes.follow,
  TwitchEventTypes.bits,
  // TwitchEventTypes.channelPoints,
  // TwitchEventTypes.host,
  TwitchEventTypes.message,
  TwitchEventTypes.raid,
  TwitchEventTypes.ban,
  TwitchEventTypes.subscription,
  TwitchEventTypes.gift
];
