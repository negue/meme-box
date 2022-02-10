import {TwitchEventTypes} from './types';

// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',   // TODO CHECK if a rename is possible without breaking anything
  TAGS: 'tags',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  ERROR: 'error',
  OPEN: 'open',
  STATE: 'state',

  TIMED_EVENTS: 'timed_events',
  NETWORK_LIST: 'network_ip_list',

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
    TRIGGER_ACTION: '/trigger/'
  },

  FILE: {
    PREFIX: 'file',
    ANY_FILE: '/*',
    BY_ID: '/fileById/',
    PREVIEW: '/preview/'
  },
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
  ACTION_ACTIVITY: '/ws/action_activity',
  CONNECTIONS_STATE: '/ws/connections_state',
  ERRORS: '/ws/errors',
};

export const TWITCH_BOT_RESPONSE_CONSTS = {
  COMMANDS: '{{commands}}',
  USER: '{{user}}',
  DEFAULT_COMMANDS_TEXT: `
    @{{user}}, you are able to trigger the following commands: {{commands}}
  `.trim(),
  DEFAULT_TRIGGER: '!commands'
}

export const TWITCH_CLIENT_ID = 'zmqh0d2kwa9r24eecywm5uhhryggm4';

export const DEFAULT_TWITCH_SCOPES = [
  // 'user:read:email',            // ???
  'chat:read',                     // TMI - Chat
  'chat:edit',                     // TMI - Write to chat?
  'channel:read:redemptions',      // PubSub Channelpoints Event
];
