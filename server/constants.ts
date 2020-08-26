export const DEFAULT_PORT = 4444;

// merge with the other constant file

export const API_PREFIX = '/api';
export const CLIP_ENDPOINT = `${API_PREFIX}/clips`;
export const CLIP_ID_ENDPOINT = `${API_PREFIX}/clips/:clipId`;
export const SCREEN_ENDPOINT = `${API_PREFIX}/screen`;
export const SCREEN_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId`;
export const SCREEN_CLIPS_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips`;
export const SCREEN_CLIPS_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips/:clipId`;


export const TWITCH_ENDPOINT = `${API_PREFIX}/twitch_events`;
export const TWITCH_ID_ENDPOINT = `${API_PREFIX}/twitch_events/:eventId`;
export const TWITCH_TRIGGER_ENDPOINT = `${API_PREFIX}/twitch_events/trigger`;


export const CONFIG_ENDPOINT = `${API_PREFIX}/config`;
export const CONFIG_MEDIA_ENDPOINT = `${API_PREFIX}/config/media`;
export const CONFIG_TWITCH_CHANNEL_ENDPOINT = `${API_PREFIX}/config/twitchChannel`;
export const FILES_ENDPOINT = `/files`;
export const FILES_OPEN_ENDPOINT = `/files/open`;
export const FILE_ENDPOINT = `/file/*`;
export const NETWORK_IP_LIST_ENDPOINT = `/network_ip_list`;

