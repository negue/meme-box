import {TwitchEventTypes} from './types';

// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',
  TAGS: 'tags',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  ERROR: 'error',
  OPEN: 'open',
  STATE: 'state',

  TWITCH_EVENTS: 'twitch_events',
  TIMED_EVENTS: 'timed_events',
  TWITCH_TRIGGER: 'twitch_events/trigger',
  NETWORK_LIST: 'network_ip_list',

  CONFIG: {
    PREFIX: 'config',
    TWITCH: '/twitch',
    OBS: '/obs',
    CUSTOM_PORT: '/customPort'
  },

  TWITCH_DATA: {
    PREFIX: 'twitchData',
    HELIX: '/helix',
    AUTH_INFORMATIONS: '/authInformations',
    CHANNEL_POINT_LIST: '/currentChannelPointRedemptions'
  },


  ACTION_ACTIVITY: {
    PREFIX: 'actionActivity',
    CURRENT: '/current'
  }
}

export const OPEN_CONFIG_PATH = `/config`;
export const OPEN_FILES_PATH = `/files`;

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

export const WEBSOCKET_PATHS = {
  TWITCH_EVENTS: '/ws/twitch_events',
  ACTION_ACTIVITY: '/ws/action_activity'
}
