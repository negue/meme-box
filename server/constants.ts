import {BRANCH} from '@memebox/version';

export const DEFAULT_PORT = 6363; // T9 for MEME

export const IS_NIGHTLY = BRANCH !== 'release';
export const REMOTE_RELEASE_VERSION_FILE = `https://raw.githubusercontent.com/negue/meme-box/release/version_update.json`;
export const REMOTE_NIGHTLY_VERSION_FILE = `https://raw.githubusercontent.com/negue/meme-box-nightly/main/last_commit.json`;
export const RELEASE_PAGE = 'https://github.com/negue/meme-box/releases';
export const TUTORIALS_GITHUB_PAGE = `https://github.com/negue/meme-box/tree/${BRANCH}/tutorials`;

export interface MarkdownDialogPayload {
  name: string;
  githubName: string;
  hideFromOverview?: boolean;
  showHeader: boolean;
}

export const SCRIPT_TUTORIAL: MarkdownDialogPayload =
    {
      name: 'Action Type: Scripts',
      githubName: 'scripts.md',
      showHeader: false
    };

export const WIDGET_TUTORIAL: MarkdownDialogPayload =
  {
    name: 'Media Type: Widget',
    githubName: 'widgets.md',
    showHeader: false
  };


export const MARKDOWN_FILES: MarkdownDialogPayload[] = [
  {
    name: 'Getting Started',
    githubName: 'getting_started.md',
    showHeader: true
  },
  {
    name: 'Type Overview',
    githubName: 'type_overview.md',
    showHeader: false
  },
  {
    name: 'Action Type: Meta',
    githubName: 'meta_media.md',
    showHeader: false
  },
  SCRIPT_TUTORIAL,
  WIDGET_TUTORIAL,
  {
    name: 'Store API',
    githubName: 'store.md',
    showHeader: false,
    hideFromOverview: true
  },
  {
    name: 'Screen / visible Media Advanced Settings',
    githubName: 'screen_media_advanced_settings.md',
    showHeader: false
  },
  {
    name: 'Import / Export',
    githubName: 'examples/import_export_settings.md',
    showHeader: false
  },
  {
    name: 'Installation',
    githubName: 'installation.md',
    hideFromOverview: true,
    showHeader: true
  }
];

// TODO merge with the other constant file

export const API_PREFIX = '/api';
export const TAGS_ENDPOINT = `${API_PREFIX}/tags`;
export const LOG_ENDPOINT = `${API_PREFIX}/error`;
export const DANGER_ENDPOINT = `${API_PREFIX}/danger`;
export const CLIP_ENDPOINT = `${API_PREFIX}/clips`;
export const CLIP_ID_ENDPOINT = `${API_PREFIX}/clips/:clipId`;

export const TIMED_ENDPOINT = `${API_PREFIX}/timed_events`;

export const STATE_ENDPOINT = `${API_PREFIX}/state`;


export const DANGER_CLEAN_CONFIG_ENDPOINT = `${API_PREFIX}/danger/clean_config`;
export const DANGER_IMPORT_ALL_ENDPOINT = `${API_PREFIX}/danger/add_all`;
export const NETWORK_IP_LIST_ENDPOINT = `/network_ip_list`;

