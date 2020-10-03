import {typeCheckFor} from "ts-type-checked";
import {Clip, ScreenClip, Tag, Twitch} from "../projects/contracts/src/lib/types";

export const objIsClip = typeCheckFor<Clip>();
export const objIsClipWithoutId = typeCheckFor<Omit<Clip, 'id'>>();
export const objIsScreen = typeCheckFor<Screen>();

export const objIsScreenClip = typeCheckFor<ScreenClip>();
export const objIsTwitch = typeCheckFor<Twitch>();
export const objIsTag = typeCheckFor<Tag>();

