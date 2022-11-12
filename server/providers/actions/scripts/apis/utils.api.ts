import {randomElement} from "@memebox/utils";

// since its only one layer, a simple Object.freeze is enough (to prevent overrides)

export const UtilsApi = Object.freeze({
  randomElement,
});
