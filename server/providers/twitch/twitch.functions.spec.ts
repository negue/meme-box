import {TwitchCheerMessage, TwitchEventTypes, TwitchTrigger} from "@memebox/contracts";
import {getCommandsOfTwitchEvent} from "./twitch.functions";
import {ChatUserstate} from "tmi.js";

describe('twitch functions', () => {

  it('should return two commands based on cheers' , () => {
    const allTwitchItems: TwitchTrigger[] = [
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
      },

      {
        id: '3',
        active: false,
        clipId: 'clip3',
        name: 'some name - inactive',
        minAmount: 70,
        event: TwitchEventTypes.bits,
        roles: []
      }
    ];

    const iterator = getCommandsOfTwitchEvent(
      allTwitchItems,
      new TwitchCheerMessage({
        channel: 'any',
        userstate: {
          bits: '123'
        } as Partial<ChatUserstate>,
        message: 'some message'
      })
    );

    const result = [...iterator];

    expect(result.length).toBe(2);
  });
});
