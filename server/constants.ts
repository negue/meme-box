export const WS_PORT = 4444;
export const EXPRESS_PORT = 4445;


export const API_PREFIX = '/api';
export const CLIP_ENDPOINT = `${API_PREFIX}/clips`;
export const CLIP_ID_ENDPOINT = `${API_PREFIX}/clips/:clipId`;
export const SCREEN_ENDPOINT = `${API_PREFIX}/screen`;
export const SCREEN_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId`;
export const SCREEN_CLIPS_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips`;
export const SCREEN_CLIPS_ID_ENDPOINT = `${API_PREFIX}/screen/:screenId/clips/:clipId`;


export const TWITCH_ENDPOINT = `${API_PREFIX}/twitch_events`;
export const TWITCH_ID_ENDPOINT = `${API_PREFIX}/twitch_events/:eventId`;


export const CONFIG_ENDPOINT = `${API_PREFIX}/config`;
export const FILE_ENDPOINT = `/file/*`;

