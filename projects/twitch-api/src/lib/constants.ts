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
    features: [
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

export const TWITCH_BOT_RESPONSE_CONSTS = {
  COMMANDS: '{{commands}}',
  USER: '{{user}}',
  DEFAULT_COMMANDS_TEXT: `
    @{{user}}, you are able to trigger the following commands: {{commands}}
  `.trim(),
  DEFAULT_TRIGGER: '!commands'
}
