import {TRANSLOCO_SCOPE} from "@ngneat/transloco";

export const TRANSLOCO_COMMON_SCOPE  = {
  provide: TRANSLOCO_SCOPE, useValue: { scope: 'common' },
  multi: true
};
export const TRANSLOCO_CONFIG_SCOPE  = {
  provide: TRANSLOCO_SCOPE, useValue: { scope: 'config' },
  multi: true
};
export const TRANSLOCO_TWITCH_SCOPE  = {
  provide: TRANSLOCO_SCOPE, useValue: { scope: 'twitch' },
  multi: true
};
