import {AppState, VisibilityEnum} from "@memebox/contracts";
import {uuid} from "@gewd/utils";

export function setDummyData(state: AppState) {
  const newScreenId = uuid();

  // in the future there will be more examples added
  const clipA = uuid();
  const clipB = uuid();

  state.screen[newScreenId] = {
    "name": "Firefox",
    "id": newScreenId,
    "clips": {
      [clipA]: {
        "position": 0,
        "id": clipA,
        "left": null,
        "right": null,
        "bottom": null,
        "top": null,
        "imgFit": null,
        visibility: VisibilityEnum.Play,
        animationIn: "random",
        animationOut: "random",
      },
      [clipB]: {
        "position": 0,
        "id": clipB,
        "left": null,
        "right": null,
        "bottom": null,
        "top": null,
        "imgFit": null,
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
      "clipLength": null,
      "playLength": 4000,
      "path": "https://www.fillmurray.com/460/300",
      "previewUrl": null
    },
    [clipB]: {
      "id": clipB,
      "name": "Placekitten",
      "type": 0,
      "volumeSetting": 100,
      "clipLength": null,
      "playLength": 4000,
      "path": "https://placekitten.com/408/287",
      "previewUrl": null
    },
  }
}
