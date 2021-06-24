export const ACTIONS = {
  I_AM_OBS: 'I_AM_OBS',
  TRIGGER_CLIP: 'TRIGGER_CLIP',  // the only "public" websocket action
  UPDATE_DATA: 'UPDATE_DATA',
  RELOAD_SCREEN: 'RELOAD_SCREEN',

  MEDIA_STATE: 'MEDIA_STATE',

  // todo trigger websocket calls from screens
  REGISTER_SCREEN_INSTANCE: 'REGISTER_SCREEN_INSTANCE',
  UNREGISTER_SCREEN_INSTANCE: 'UNREGISTER_SCREEN_INSTANCE',

  // payload="mediaId|instanceId"
  REGISTER_WIDGET_INSTANCE: 'REGISTER_WIDGET_INSTANCE',
  UNREGISTER_WIDGET_INSTANCE: 'UNREGISTER_WIDGET_INSTANCE',
}

export enum TriggerClipOrigin {
  Unknown,
  AppPreview,
  StreamDeck, // currently also Unknown
  TwitchEvent,
  Timer,
  Meta,
  Scripts
}

export interface TriggerAction {
  id: string;
  targetScreen?: string;

  fromWebsocket?: boolean;
  origin?: TriggerClipOrigin;
  originId?: string;

  repeatX?: number;
  repeatSecond?: number;

  // soon there will be more "overrides" to everything
}

export interface MediaStatePayload {
  mediaId: string;
  screenId?: string;
  active: boolean;
}
