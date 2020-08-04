import {TwitchEventTypes} from "./types";

export const ENDPOINTS = {
  CLIPS: 'clips',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  TWITCH_EVENTS: 'twitch_events',
  NETWORK_LIST: 'network_ip_list',
  CONFIG_MEDIA_PATH: 'config/media'
}


export const TwitchTypesArray = [
  TwitchEventTypes.follow,
  TwitchEventTypes.sub,
  TwitchEventTypes.bits,
  TwitchEventTypes.channelPoints,
  TwitchEventTypes.host,
  TwitchEventTypes.message,
  TwitchEventTypes.raid,
];
