import {AppService} from "../../../../../projects/app-state/src/lib/state/app.service";
import {Action, ActionType, Screen, Tag} from "@memebox/contracts";
import {sleep, uuid} from "@gewd/utils";

const allTypes = [
  ActionType.Audio,
  ActionType.Picture,
  ActionType.Video,
  ActionType.Widget,
  ActionType.IFrame,
  ActionType.Recipe,
]

export async function addMoreItems (service: AppService): Promise<void> {
  const amountOfItems = [1,2,3,4,5,6];
  const allMedias: Action [] = [];

  for (const i of amountOfItems) {
    const newTag: Tag = {
      id: uuid(),
      name: `tag-${i}`,
      color: ''
    };

    await service.addOrUpdateTag(newTag);

    for (const type of allTypes) {
      const newClip: Action = {
        id: uuid(),
        name: `clip-${i}`,
        type: type,
        playLength: 1337,
        path: '',
        tags: [newTag.id]
      };

      await service.addOrUpdateAction(newClip);

      allMedias.push(newClip);
    }

    await sleep(150);
  }

  for (const i of amountOfItems) {
    const newScreen: Screen = {
      id: uuid(),
      name: `screen-${i}`,
      height: 1080,
      width: 1920,
      clips: {}
    };

    await service.addOrUpdateScreen(newScreen);

    for (const media of allMedias) {
      await service.addOrUpdateScreenMedia(newScreen.id, {
        id: media.id,
      });

      await sleep(15);
    }
  }
}

