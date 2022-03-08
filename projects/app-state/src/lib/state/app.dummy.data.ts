import {AppState, VisibilityEnum} from "@memebox/contracts";
import {uuid} from "@gewd/utils";

export function setDummyData(state: AppState) {
  const newScreenId = uuid();

  // in the future there will be more examples added
  const clipA = uuid();
  const clipB = uuid();

  state.screen[newScreenId] = {
    "name": "Example OBS Browsersource",
    "id": newScreenId,
    "clips": {
      [clipA]: {
        "position": 0,
        "id": clipA,
        visibility: VisibilityEnum.Play,
        animationIn: "random",
        animationOut: "random",
      },
      [clipB]: {
        "position": 0,
        "id": clipB,
        visibility: VisibilityEnum.Play,
        animationIn: "random",
        animationOut: "random",
      },
    },
    height: 1080,
    width: 1920
  };

  state.clips = {
    [clipA]: {
      "id": clipA,
      "name": "Fill Murray",
      "type": 0,
      "volumeSetting": 10,
      "playLength": 4000,
      "path": "https://www.fillmurray.com/460/300"
    },
    [clipB]: {
      "id": clipB,
      "name": "Placekitten",
      "type": 0,
      "volumeSetting": 100,
      "playLength": 4000,
      "path": "https://placekitten.com/408/287"
    },
  }
}
