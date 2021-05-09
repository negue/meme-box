export const ACTIONS = {
  I_AM_OBS: 'I_AM_OBS',
  TRIGGER_CLIP: 'TRIGGER_CLIP',
  UPDATE_DATA: 'UPDATE_DATA',
  RELOAD_SCREEN: 'RELOAD_SCREEN'
}

export interface TriggerClip {
  id: string;
  targetScreen?: string;
  repeatX?: number;
  repeatSecond?: number;

  // soon there will be more "overrides" to everything
}
