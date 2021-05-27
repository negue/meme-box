import {AppService} from "../../../state/app.service";
import {Clip, MediaType, Screen, Tag} from "@memebox/contracts";
import {sleep, uuid} from "@gewd/utils";

const allTypes = [
  MediaType.Audio,
  MediaType.Picture,
  MediaType.Video,
  MediaType.Widget,
  MediaType.IFrame,
  MediaType.Meta,
]

export async function addMoreItems (service: AppService): Promise<void> {
  const amountOfItems = [1,2,3,4,5,6];
  const allMedias: Clip [] = [];

  for (const i of amountOfItems) {
    const newTag: Tag = {
      id: uuid(),
      name: `tag-${i}`,
      color: ''
    };

    await service.addOrUpdateTag(newTag);

    for (const type of allTypes) {
      const newClip: Clip = {
        id: uuid(),
        name: `clip-${i}`,
        type: type,
        playLength: 1337,
        path: '',
        tags: [newTag.id]
      };

      await service.addOrUpdateClip(newClip);

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
      await service.addOrUpdateScreenClip(newScreen.id, {
        id: media.id,
      });

      await sleep(15);
    }
  }
}

