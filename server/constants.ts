export const DEFAULT_PORT = 4444;

export const REMOTE_VERSION_FILE = 'https://raw.githubusercontent.com/negue/meme-box/master/version_update.json';
export const RELEASE_PAGE = 'https://github.com/negue/meme-box/releases';
export const TUTORIALS_GITHUB_PAGE = 'https://github.com/negue/meme-box/tree/master/tutorials';

export interface MarkdownDialogPayload {
  name: string;
  githubName: string;
}

export const MARKDOWN_FILES: MarkdownDialogPayload[] = [
  {
    name: 'Getting Started',
    githubName: 'getting_started.md'
  },
  {
    name: 'Type Overview',
    githubName: 'type_overview.md'
  }
];

// TODO merge with the other constant file

export const API_PREFIX = '/api';
export const TAGS_ENDPOINT = `${API_PREFIX}/tags`;
export const LOG_ENDPOINT = `${API_PREFIX}/error`;
export const DANGER_ENDPOINT = `${API_PREFIX}/danger`;
export const CLIP_ENDPOINT = `${API_PREFIX}/clips`;
export const CLIP_ID_ENDPOINT = `${API_PREFIX}/clips/:clipId`;
export const SCREEN_ENDPOINT = `${API_PREFIX}/screen`;
export const SCREEN_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId`;
export const SCREEN_CLIPS_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips`;
export const SCREEN_CLIPS_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips/:clipId`;


export const TWITCH_ENDPOINT = `${API_PREFIX}/twitch_events`;
export const TIMED_ENDPOINT = `${API_PREFIX}/timed_events`;

export const STATE_ENDPOINT = `${API_PREFIX}/state`;

export const CONFIG_ENDPOINT = `${API_PREFIX}/config`;
export const CONFIG_TWITCH_CHANNEL_PATH = '/twitchChannel';
export const CONFIG_TWITCH_LOG_PATH = '/twitchLog';
export const CONFIG_TWITCH_BOT_INTEGRATION_PATH = '/twitchBotIntegration';
export const CONFIG_TWITCH_BOT_PATH = '/twitchBot';
export const CONFIG_OPEN_PATH = `/open`;

export const DANGER_CLEAN_CONFIG_ENDPOINT = `${API_PREFIX}/danger/clean_config`;
export const DANGER_IMPORT_ALL_ENDPOINT = `${API_PREFIX}/danger/add_all`;
export const FILES_ENDPOINT = `/files`;
export const FILES_OPEN_ENDPOINT = `/files/open`;
export const FILE_ENDPOINT = `/file/*`;
export const NETWORK_IP_LIST_ENDPOINT = `/network_ip_list`;

