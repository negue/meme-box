import * as tmi from 'tmi.js';
import {Subscription} from "rxjs";
import {PersistenceInstance} from "./persistence";
import {startWith} from "rxjs/operators";
import {Twitch, TwitchEventTypes, TwitchTriggerCommand} from "../projects/contracts/src/lib/types";
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
      if (!message.startsWith("!")) {
        return;
      }

      this.handle({
        event: TwitchEventTypes.message,
        message
      });

      // "Alca: Hello, World!"
      console.log(`${tags['display-name']}: ${message}`, tags);
    });

    this.tmiClient.on('action', (channel, tags, message, self) => {

      console.log(`${tags['display-name']}: ${message}`, channel, tags);
    })

  }

  handle(command: TwitchTriggerCommand) {
    for (const twitchSetting of this.twitchSettings){
      if (!twitchSetting.active){
        continue;
      }

      console.info('Checking', twitchSetting);

      if (twitchSetting.event === command.event
        && command.message.includes(twitchSetting.contains)) {
        console.info('Contained', twitchSetting.contains);
        triggerMediaClipById({
          id: twitchSetting.clipId
        });

        break;
      }
    }
  }
}
