import * as tmi from 'tmi.js';
import { Subscription } from 'rxjs';
import { PersistenceInstance } from './persistence';
import { startWith } from 'rxjs/operators';
import { Twitch, TwitchEventTypes, TwitchTriggerCommand } from '../projects/contracts/src/lib/types';
import { triggerMediaClipById } from './websocket-server';

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

const _DEBUG = true;
const tmiConfig = {
  connection: {
    secure: true,
    reconnect: true
  }
};

if (_DEBUG) {
  tmiConfig.connection['server'] = 'irc.fdgt.dev';
  tmiConfig['channels'] = ['fdgt'];
  //Doesn't need password set, but needs to have this object present in order for fdgt to work.
  tmiConfig['identity'] = { username: 'meme-box', password: '' };
}

export class TwitchHandler {
  private tmiClient: tmi.Client;
  private persistenceSubscription: Subscription;
  private twitchSettings: Twitch[] = [];

  constructor(twitchAccount: string) {
    if (!_DEBUG) {
      tmiConfig['channels'] = [twitchAccount];
    }

    this.tmiClient = tmi.Client(tmiConfig);

    this.connectAndListen();
  }


  public disconnect() {
    if (this.persistenceSubscription) {
      this.persistenceSubscription.unsubscribe();
    }
    this.tmiClient.disconnect();
  }

  private async connectAndListen() {
    const connectionResult = await this.tmiClient.connect();

    this.persistenceSubscription = PersistenceInstance.dataUpdated$().pipe(
      startWith(true)
    ).subscribe(value => {
      console.info('Data Updated got the new events');
      this.twitchSettings = PersistenceInstance.listTwitchEvents();
    });

    this.tmiClient.on('message', (channel, tags, message, self) => {
      const command = this.getCommandOfMessage(message);

      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });

      console.log(`TMI-Message: ${tags['display-name']}: ${message}`, tags);
    });

    this.tmiClient.on('action', (channel, tags, message, self) => {
      const command = this.getCommandOfMessage(message);

      // todo add the correct twitchevent-types?
      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });

      console.log(`TMI-Action: ${tags['display-name']}: ${message}`, channel, tags);
    });


    this.tmiClient.on('cheer', (channel, tags, message) => {
      const command = this.getCommandOfMessage(message);

      // todo add the correct twitchevent-types!

      //TODO: Review if the user messages should be allowed to play a media. Because someone could send bits with
      // a message of !wow and trigger 2 clips at the same time that could overlap
      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });

      //if the amount for bits is present
      if (tags.bits !== undefined) {
        this.twitchSettings.forEach((twitchEvent: Twitch) => {
          //TODO: Review if we should show each event that matches the criteria or only the first one?
          if (twitchEvent['event'] === TwitchEventTypes.bits && tags.bits <= twitchEvent['bitAmount']) {
            this.handle({
              message,
              command: twitchEvent,
              tags
            });
          }
        });
      }

      console.log(`TMI-Cheer: ${tags['display-name']}: ${message}`, channel, tags);
    });

    if (_DEBUG) {
      setTimeout(() => {
        this.tmiClient.say('fdgt', 'bits').catch(err => console.log(err));
      }, 2000);
    }
  }

  getCommandOfMessage(message: string): Twitch {
    if (!message) {
      return null;
    }

    let foundCommand: Twitch = null;
    for (const twitchSetting of this.twitchSettings) {
      if (!twitchSetting.active) {
        continue;
      }

      if (message.toLowerCase().includes(twitchSetting.contains.toLowerCase())) {
        if (!foundCommand) {
          foundCommand = twitchSetting;
        } else {
          // another command, example
          //!party
          //!partyhard
          // always take the "longer" command

          if (foundCommand.contains.length < twitchSetting.contains.length) {
            foundCommand = twitchSetting;
          }
        }
      }
    }

    return foundCommand;
  }

  getLevelOfTags(userState: tmi.Userstate): string[] {
    const levels = ['user'];

    if (!userState.badges) {
      return levels;
    }

    if (userState.badges.broadcaster) {
      levels.push('broadcaster');
    }

    if (userState.badges.moderator) {
      levels.push('moderator');
    }

    if (userState.badges.founder) {
      levels.push('founder', 'subscriber');
    }

    if (userState.badges.subscriber) {
      levels.push('subscriber');
    }

    if (userState.badges.vip) {
      levels.push('vip');
    }

    return levels;
  }

  handle(trigger: TwitchTriggerCommand) {
    if (trigger.command) {
      console.info('Contained', trigger.command.contains);
      console.info('Full Message', trigger.message);
      console.info('Tags', trigger.tags);

      const foundLevels = this.getLevelOfTags(trigger.tags);

      console.info('Found Levels', foundLevels);
      console.info('Needed Levels', trigger.command?.roles);

      if (foundLevels.includes('broadcaster') || trigger.command?.roles.some(r => foundLevels.includes(r))) {
        console.info('Triggering Clip: ', trigger.command.clipId);

        triggerMediaClipById({
          id: trigger.command.clipId
        });
      }
    }
  }
}
