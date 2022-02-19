import {PositionEnum, VisibilityEnum} from "@memebox/contracts";

// since its only one layer, a simple Object.freeze is enough (to prevent overrides)
export const EnumsApi = Object.freeze({
  PositionEnum,
  VisibilityEnum
});
