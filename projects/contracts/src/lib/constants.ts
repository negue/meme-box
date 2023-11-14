// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',   // TODO CHECK if a rename is possible without breaking anything
  TAGS: 'tags',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  ERROR: 'error',
  STATE: 'state',

  NETWORK_LIST: 'network_ip_list',

  OPEN: {
    PREFIX: 'open',
    CONFIG: '/config',
    FILES: '/files',
  },

  CONFIG: {
    PREFIX: 'config',
    TWITCH: '/twitch',
    TWITCH_REVOKE: '/twitchRevoke/',
    OBS: '/obs',
    CUSTOM_PORT: '/customPort'
  },


  TRIGGER_CONFIGS: {
    PREFIX: 'trigger_configs',
    TRIGGER_CONFIG_EXAMPLE: '/trigger_config_example',
    TRIGGER_ONE: '/trigger_one',
    LAST_20_EVENTS: '/last_triggered'
  },

  OBS_DATA: {
    PREFIX: 'obsData',
    CURRENT_BROWSER_SOURCES: '/currentBrowserSources',
    REFRESH_BROWSER_SOURCE: '/refreshBrowserSource',
    SCENE_LIST: '/sceneList',
    SOURCE_LIST: '/sourceList',
    SOURCE_FILTER_LIST: '/sourceFilters/',
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
  },
}

export const WEBSOCKET_PATHS = {
  TWITCH_EVENTS: '/ws/twitch_events',
  ACTION_ACTIVITY: '/ws/action_activity',
  SCREEN_ACTIVITY: '/ws/screen_activity',
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

export interface TwitchScopeMetadata {
  scope: string;
  features: string[];
}

export const DEFAULT_TWITCH_SCOPES: TwitchScopeMetadata[] = [
  {
    scope: 'chat:read',
    features: [
      'Listening to chat messages ...duh'
    ]
  },
  {
    scope: 'chat:edit',
    features: [
      'Writing in the Chat'
    ]
  },
  {
    scope: 'channel:read:redemptions',
    features:[
      'Trigger: Channel Point Redemption'
    ]
  },
  {
    // https://dev.twitch.tv/docs/api/reference#send-chat-announcement
    scope: 'moderator:manage:announcements',
    features: [
      'Ability to write Chat Announcements'
    ]
  },
  {
    // https://dev.twitch.tv/docs/api/reference#delete-chat-messages
    scope: 'moderator:manage:chat_messages',
    features: [
      'Clear the chat'
    ]
  },
  {
    // https://dev.twitch.tv/docs/api/reference#start-commercial
    scope: 'channel:edit:commercial',
    features: [
      'Start Commercial'
    ]
  },
  /*{
    // https://dev.twitch.tv/docs/api/reference#start-a-raid
    scope: 'channel:manage:raids',
    features: [
      'Start a raid'
    ]
  },*/
  {
    // https://dev.twitch.tv/docs/api/reference#create-stream-marker
    scope: 'channel:manage:broadcast',
    features: [
      'Create Stream Marker'
    ]
  },
  {
    // https://dev.twitch.tv/docs/api/reference#update-chat-settings
    scope: 'moderator:manage:chat_settings',
    features: [
      'Update Chat Settings: Slow, Sub only, Follower only, Unique'
    ]
  }
];

export const DEFAULT_TWITCH_SCOPE_LIST = DEFAULT_TWITCH_SCOPES.map(s => s.scope);
