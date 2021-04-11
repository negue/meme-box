import {Twitch, TwitchEventTypes} from "@memebox/contracts";
import {getCommandsOfMessage} from "./twitch.functions";

describe('twitch functions', () => {

  it('should return two commands based on cheers' , () => {
    const allTwitchItems: Twitch[] = [
      {
        id: '1',
        active: true,
        clipId: 'clip1',
        name: 'some name',
        maxAmount: 200,
        event: TwitchEventTypes.bits,
        roles: []
      },
      {
        id: '2',
        active: true,
        clipId: 'clip2',
        name: 'some name',
        minAmount: 70,
        event: TwitchEventTypes.bits,
        roles: []
      }
    ];

    const iterator = getCommandsOfMessage(
      allTwitchItems,
      '', TwitchEventTypes.bits, {
        amount: 100
      }
    );

    const result = [...iterator];

    expect(result.length).toBe(2);
  });
});
