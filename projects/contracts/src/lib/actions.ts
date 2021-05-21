export const ACTIONS = {
  I_AM_OBS: 'I_AM_OBS',
  TRIGGER_CLIP: 'TRIGGER_CLIP',  // the only "public" websocket action
  UPDATE_DATA: 'UPDATE_DATA',
  RELOAD_SCREEN: 'RELOAD_SCREEN',

  REGISTER_SCREEN_INSTANCE: 'REGISTER_SCREEN_INSTANCE',
  UNREGISTER_SCREEN_INSTANCE: 'UNREGISTER_SCREEN_INSTANCE',

  // payload="mediaId|instanceId"
  REGISTER_WIDGET_INSTANCE: 'REGISTER_WIDGET_INSTANCE',
  UNREGISTER_WIDGET_INSTANCE: 'UNREGISTER_WIDGET_INSTANCE',
}

export interface TriggerClip {
  id: string;
  targetScreen?: string;
  repeatX?: number;
  repeatSecond?: number;

  // soon there will be more "overrides" to everything
  message?:string;
}
