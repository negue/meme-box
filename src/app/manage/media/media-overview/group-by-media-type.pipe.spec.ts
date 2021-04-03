import { GroupByMediaTypePipe, MediGroup } from './group-by-media-type.pipe';
import { Clip, MediaType } from '@memebox/contracts';

describe('GroupByMediaTypePipe', () => {
  it('outputs to correct groups', () => {
    const clips: Partial<Clip>[] = [
      {
        id: '1',
        type: MediaType.Audio
      },
      {
        id: '2',
        type: MediaType.Audio
      },
      {
        id: '3',
        type: MediaType.Picture
      }
    ];

    const pipe = new GroupByMediaTypePipe();

    expect(pipe.transform(clips as Clip[])).toEqual([
      {
        groupName: 'Image',
        medias: [clips[2]]
      },
      {
        groupName: 'Audio',
        medias: [clips[0], clips[1]]
      }
    ] as MediGroup[]);
  });

  it('groups unknown types to the unknown category', () => {
    const clips: Partial<Clip>[] = [
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

    expect(pipe.transform(clips as Clip[])).toEqual([
      {
        groupName: 'Unknown type',
        medias: clips
      }
    ] as MediGroup[]);
  });
});
