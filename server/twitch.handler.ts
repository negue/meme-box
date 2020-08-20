import * as tmi from 'tmi.js';
import {Subscription} from "rxjs";
import {PersistenceInstance} from "./persistence";
import {startWith} from "rxjs/operators";
import {Twitch, TwitchTriggerCommand} from "../projects/contracts/src/lib/types";
import {triggerMediaClipById} from "./websocket-server";


export class TwitchHandler {
  private tmiClient: tmi.Client;
  private persistenceSubscription: Subscription;
  private twitchSettings: Twitch[] = [];

  constructor(twitchAccount: string) {
    this.tmiClient = tmi.Client({
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [ twitchAccount ]
    });

    this.connectAndListen();
  }


  public disconnect() {
    if (this.persistenceSubscription) {
      this.persistenceSubscription.unsubscribe();
    }
    this.tmiClient.disconnect();
  }

  private async connectAndListen () {
    const connectionResult = await this.tmiClient.connect();

    this.persistenceSubscription = PersistenceInstance.dataUpdated$().pipe(
      startWith(true),
    ).subscribe(value => {
      console.info('Data Updated got the new events');
      this.twitchSettings = PersistenceInstance.listTwitchEvents();
    })

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
      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });

      console.log(`TMI-Cheer: ${tags['display-name']}: ${message}`, channel, tags);
    });
  }

  getCommandOfMessage (message: string): Twitch {
    if (!message) {
      return null;
    }

    let foundCommand: Twitch = null;
    for (const twitchSetting of this.twitchSettings) {
      if (!twitchSetting.active) {
        continue;
      }

      if (message.includes(twitchSetting.contains)) {
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

  handle(trigger: TwitchTriggerCommand) {
    if (trigger.command) {
      console.info('Contained', trigger.command.contains);
      console.info('Full Message', trigger.message);
      console.info('Tags', trigger.tags);
      triggerMediaClipById({
        id: trigger.command.clipId
      });
    }
  }
}
