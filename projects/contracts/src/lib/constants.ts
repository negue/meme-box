import {TwitchEventTypes} from "./types";

// TODO merge App / Server Endpoint CONSTANTS

export const ENDPOINTS = {
  CLIPS: 'clips',
  SCREEN: 'screen',
  OBS_CLIPS: 'clips',
  TWITCH_EVENTS: 'twitch_events',
  TWITCH_TRIGGER: 'twitch_events/trigger',
  NETWORK_LIST: 'network_ip_list',
  CONFIG_MEDIA_PATH: 'config/media',
  CONFIG_TWITCH_CHANNEL: 'config/twitchChannel'
}


export const TwitchTypesArray = [
  // TwitchEventTypes.follow,
  // TwitchEventTypes.sub,
  // TwitchEventTypes.bits,
  // TwitchEventTypes.channelPoints,
  // TwitchEventTypes.host,
  TwitchEventTypes.message,
  // TwitchEventTypes.raid,
];
