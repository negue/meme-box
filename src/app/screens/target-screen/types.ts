import {Clip, ScreenClip} from "@memebox/contracts";

export interface CombinedClip {
  clip: Clip;
  clipSetting: ScreenClip;
  backgroundColor: string;
}
