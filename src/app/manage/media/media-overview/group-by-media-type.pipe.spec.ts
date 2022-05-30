import { ActionTypeGroup, GroupByMediaTypePipe } from './group-by-media-type.pipe';
import { Action, ActionType } from '@memebox/contracts';

describe('GroupByMediaTypePipe', () => {
  it('outputs to correct groups', () => {
    const clips: Partial<Action>[] = [
      {
        id: '1',
        type: ActionType.Audio
      },
      {
        id: '2',
        type: ActionType.Audio
      },
      {
        id: '3',
        type: ActionType.Picture
      }
    ];

    const pipe = new GroupByMediaTypePipe();

    expect(pipe.transform(clips as Action[])).toEqual([
      {
        groupName: 'actionType.audio',
        mediaType: 1,
        medias: [clips[0], clips[1]]
      },
      {
        groupName: 'actionType.image',
        mediaType: 0,
        medias: [clips[2]]
      },
    ] as ActionTypeGroup[]);
  });

  it('groups unknown types to the unknown category', () => {
    const clips: Partial<Action>[] = [
      {
        id: '1',
        type: -10
      },
      {
        id: '2',
        type: 1337
      },
      {
        id: '3',
        type: 1338
      }
    ];

    const pipe = new GroupByMediaTypePipe();

    expect(pipe.transform(clips as Action[])).toEqual([
      {
        groupName: 'invalid',
        mediaType: -10,
        medias: clips
      }
    ] as ActionTypeGroup[]);
  });
});
