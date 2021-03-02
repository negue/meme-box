import { AppState, VisibilityEnum } from "@memebox/contracts";

export function setDummyData(state: AppState) {
  state.screen["356a0f2f-6d3a-4fbd-b2db-45b0fd97546a"] = {
    "name": "Firefox",
    "id": "356a0f2f-6d3a-4fbd-b2db-45b0fd97546a",
    "clips": {
      "cbdc0e82-d23f-4b94-96cc-c6438753ca53": {
        "position": 0,
        "id": "cbdc0e82-d23f-4b94-96cc-c6438753ca53",
        "width": "50%",
        "height": "60%",
        "left": null,
        "right": null,
        "bottom": null,
        "top": null,
        "imgFit": null,
        visibility: VisibilityEnum.Play
      },
      "65e61814-2748-4176-ba88-e99ac411f920": {
        "position": 0,
        "id": "65e61814-2748-4176-ba88-e99ac411f920",
        "width": "50%",
        "height": "60%",
        "left": null,
        "right": null,
        "bottom": null,
        "top": null,
        "imgFit": null,
        visibility: VisibilityEnum.Play
      },
    },
    height: 1080,
    width: 1920
  };

  state.clips = {
    "cbdc0e82-d23f-4b94-96cc-c6438753ca53": {
      "id": "cbdc0e82-d23f-4b94-96cc-c6438753ca53",
      "name": "Fill Murray",
      "type": 0,
      "volumeSetting": 10,
      "clipLength": null,
      "playLength": 4000,
      "path": "https://www.fillmurray.com/460/300",
      "previewUrl": null
    },
    "65e61814-2748-4176-ba88-e99ac411f920": {
      "id": "65e61814-2748-4176-ba88-e99ac411f920",
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
