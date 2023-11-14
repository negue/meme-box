import { TwitchEventTypes } from './types';

// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',   // TODO CHECK if a rename is possible without breaking anything
  TAGS: 'tags',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  ERROR: 'error',
  STATE: 'state',

  TIMED_EVENTS: 'timed_events',
  NETWORK_LIST: 'network_ip_list',

  OPEN: {
    PREFIX: 'open',
    CONFIG: '/config',
    FILES: '/files'
  },

  CONFIG: {
    PREFIX: 'config',
    TWITCH: '/twitch',
    TWITCH_REVOKE: '/twitchRevoke/',
    OBS: '/obs',
    CUSTOM_PORT: '/customPort'
  },

  TWITCH_EVENTS: {
    PREFIX: 'twitch_events',
    TRIGGER_CONFIG_EXAMPLE: '/trigger_config_example',
    TRIGGER_EVENT: '/trigger_event',
    LAST_20_EVENTS: '/last_events'
  },

  OBS_DATA: {
    PREFIX: 'obsData',
    CURRENT_BROWSER_SOURCES: '/currentBrowserSources',
    REFRESH_BROWSER_SOURCE: '/refreshBrowserSource',
    SCENE_LIST: '/sceneList',
    SOURCE_LIST: '/sourceList',
    SOURCE_FILTER_LIST: '/sourceFilters/'
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
  },

  ACTION: {
    PREFIX: 'action',
    SIMPLE_LIST: '/simpleList',
    LAST_20_ACTIONS: '/last_actions',
    TRIGGER_ACTION: '/trigger/',
    LAST_OVERRIDES: '/lastOverrides/'
  },

  FILE: {
    PREFIX: 'file',
    ANY_FILE: '/*',
    BY_ID: '/fileById/',
    PREVIEW: '/preview/'
  }
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

export const WEBSOCKET_PATHS = {
  TWITCH_EVENTS: '/ws/twitch_events',
  ACTION_ACTIVITY: '/ws/action_activity',
  SCREEN_ACTIVITY: '/ws/screen_activity',
  CONNECTIONS_STATE: '/ws/connections_state',
  ERRORS: '/ws/errors'
};

