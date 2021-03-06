import * as tmi from 'tmi.js';
import {EmoteObj, Options} from 'tmi.js';
import {Subscription} from 'rxjs';
import {PersistenceInstance} from './persistence';
import {startWith} from 'rxjs/operators';
import {
  Dictionary,
  Twitch,
  TwitchConfig,
  TwitchEventTypes,
  TwitchTriggerCommand
} from '@memebox/contracts';
import {triggerMediaClipById} from './websocket-server';
import {Logger} from 'winston';
import {newLogger} from './logger.utils';

declare module 'tmi.js' {
  export interface Badges {
    founder?: string;
  }
}

export class TwitchHandler {
  private tmiClient: tmi.Client;
  private persistenceSubscription: Subscription;
  private twitchSettings: Twitch[] = [];
  private logger: Logger;
  private cooldownDictionary: Dictionary<number> = {}; // last timestamp of twitch command

  constructor(private twitchConfig: TwitchConfig) {
    const tmiConfig: Options = {
      //options: {debug: true},
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [twitchConfig.channel]
    };

    if (twitchConfig.bot?.enabled && twitchConfig.bot?.auth?.name && twitchConfig.bot?.auth?.token){
      tmiConfig.identity = {
        username: twitchConfig.bot.auth.name,
        password: twitchConfig.bot.auth.token
      };
    }

    this.tmiClient = tmi.Client(tmiConfig);

    if (twitchConfig.enableLog) {
      this.createLogger();
    }

    this.connectAndListen();
  }

  public disconnect() {
    if (this.persistenceSubscription) {
      this.persistenceSubscription.unsubscribe();
    }
    this.tmiClient.disconnect();
  }

  private async connectAndListen() {
    for (let tryOut = 0; tryOut < 3; tryOut++) {
      try {
        await this.tmiClient.connect();
        this.log({
          message: 'Connected to Twitch!'
        });
        break;
      } catch (ex) {
        this.error({
          ex,
          message: `Error trying to connect to twitch - ${ex.message}`
        });

        // TODO sent state to Dashboard
      }
    }

    this.persistenceSubscription = PersistenceInstance.dataUpdated$().pipe(
      startWith(true)
    ).subscribe(() => {
      this.log({
        message: 'Data Updated got the new events'
      });

      this.twitchSettings = PersistenceInstance.listTwitchEvents();
    });

    this.tmiClient.on('message', (channel, tags, message, self) => {
      if (self) return;

      if (this.twitchConfig.bot?.enabled && this.twitchConfig.bot.auth && message === '!commands') {
        this.handleCommandsRequest(tags, message);

        return false;
      }

      const command = this.getCommandOfMessage(message, TwitchEventTypes.message);

      this.log({
        type: 'message',
        tags,
        message
      });

      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });
    });

    this.tmiClient.on('cheer', (channel, tags, message) => {
      const command = this.getCommandOfMessage(message, TwitchEventTypes.bits, {
        amount: parseInt(tags.bits)
      });

      this.log({
        type: 'cheer',
        tags,
        message
      });

      // todo add the correct twitchevent-types!
      this.handle({
        // event: TwitchEventTypes.message,
        message,
        command,
        tags
      });
    });

    this.tmiClient.on('raided', (channel: string, username: string, viewers: number) => {
      const command = this.getCommandOfMessage('', TwitchEventTypes.raid, {
        amount: viewers
      });

      this.log({
        type: 'raid',
        username,
        viewers
      });

      // todo add the correct twitchevent-types!
      this.handle({
        // event: TwitchEventTypes.message,
        message: '',
        command,
        tags: {}
      });
    });

    this.subscribeToUnusedTmiEvents();

    /*
    *



    *
   anongiftpaidupgrade(channel: string, username: string, userstate: AnonSubGiftUpgradeUserstate): void;
    ban(channel: string, username: string, reason: string): void;

    clearchat(channel: string): void;

    emoteonly(channel: string, enabled: boolean): void;

    followersonly(channel: string, enabled: boolean, length: number): void;
    giftpaidupgrade(channel: string, username: string, sender: string, userstate: SubGiftUpgradeUserstate): void;
    hosted(channel: string, username: string, viewers: number, autohost: boolean): void;
    hosting(channel: string, target: string, viewers: number): void;

    messagedeleted(channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate): void;

    notice(channel: string, msgid: MsgID, message: string): void;
    raided(channel: string, username: string, viewers: number): void;

    resub(channel: string, username: string, months: number, message: string, userstate: SubUserstate, methods: SubMethods): void;
    roomstate(channel: string, state: RoomState): void;

    slowmode(channel: string, enabled: boolean, length: number): void;
    subgift(channel: string, username: string, streakMonths: number, recipient: string, methods: SubMethods, userstate: SubGiftUserstate): void;
    submysterygift(channel: string, username: string, numbOfSubs: number, methods: SubMethods, userstate: SubMysteryGiftUserstate): void;

    subscription(channel: string, username: string, methods: SubMethods, message: string, userstate: SubUserstate): void;
    timeout(channel: string, username: string, reason: string, duration: number): void;
    unhost(channel: string, viewers: number): void;

    *
    * */
  }

  handleCommandsRequest(tags: tmi.ChatUserstate, message: string): void {
    const foundLevels = this.getLevelOfTags(tags);
    const commands = this.twitchSettings.filter((event) => {
      const trigger: TwitchTriggerCommand = {message, command: event, tags};

      return (
        event.event === TwitchEventTypes.message &&
        event.contains.startsWith('!') &&
        event.active &&
        this.isAllowedToTrigger(
          trigger,
          foundLevels,
          false,
          false
        )
      );
    }).map(e => e.contains);

    const botResponse = this.twitchConfig.bot.response
      .replace('{{commands}}', commands.join(' | '))
      .replace('{{user}}', `${tags.username}`);
    this.tmiClient.say(this.twitchConfig.channel, botResponse)
      .catch(console.error);
  }

  getCommandOfMessage(
    message: string,
    event: TwitchEventTypes,
    eventOptions?: TwitchEventOptions
  ): Twitch {
    if (!message && !eventOptions) {
      return null;
    }

    let foundCommand: Twitch = null;
    for (const twitchSetting of this.twitchSettings) {
      if (!twitchSetting.active) {
        continue;
      }

      if (eventOptions && event === twitchSetting.event) {
        const minAmount = twitchSetting.minAmount || 0;
        const maxAmount = twitchSetting.maxAmount || Infinity;

        if (eventOptions.amount >= minAmount && eventOptions.amount <= maxAmount) {
          return twitchSetting;
        }
      }

      if (twitchSetting.event !== TwitchEventTypes.message) {
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
      this.log(`Trigger "${trigger.command.name}" Type - ${trigger.command.event}`);
      if (trigger.message) {
        this.log(`Trigger Message - ${trigger.message}`);
      }

      this.log({
        message: 'Trigger Tags',
        tags: trigger.tags
      });

      const foundLevels = this.getLevelOfTags(trigger.tags);
      const allowedToTrigger = this.isAllowedToTrigger(trigger, foundLevels);

      if (allowedToTrigger) {
        this.cooldownDictionary[trigger.command.id] = Date.now();

        triggerMediaClipById({
          id: trigger.command.clipId
        });
      }
    }
  }

  private isAllowedToTrigger(trigger: TwitchTriggerCommand, foundLevels: string[], showLogs = true, checkCoolDown = true): boolean {
    if (showLogs) {
      this.log({
        message: 'Trigger Levels',
        foundLevels,
        neededLevels: trigger.command?.roles
      });
    }

    const isBroadcaster = foundLevels.includes('broadcaster');

    const allowedByRole = trigger.command?.roles.some(r => foundLevels.includes(r))
      || trigger.command.event !== TwitchEventTypes.message; // all other types don't have roles

    const cooldownEntry = this.cooldownDictionary[trigger.command.id];
    const allowedByCooldown = checkCoolDown && cooldownEntry && trigger.command.cooldown ? (Date.now() - cooldownEntry) > trigger.command.cooldown : true;

    const allowedToTrigger = isBroadcaster || (allowedByRole && allowedByCooldown);

    if (showLogs) {
      this.log({
        message: `Allowed to trigger: ${trigger.command.clipId}`,
        isBroadcaster,
        allowedByRole,
        allowedByCooldown,
        allowedToTrigger
      });
    }

    return allowedToTrigger;
  }

  private createLogger() {
    this.logger = newLogger('Twitch', 'twitch');
  }

  private log(data: any) {
    if (this.twitchConfig.enableLog) {
      this.logger.info(data);
    }
  }

  private error(data: any) {
    if (this.twitchConfig.enableLog) {
      this.logger.error(data);
    }
  }

  private subscribeToUnusedTmiEvents() {

    this.tmiClient.on('emotesets', (sets: string, obj: EmoteObj) => {
      this.log({
        type: 'emotesets',
        sets,
        obj
      });
    });

    this.tmiClient.on('subscribers', (channel: string, enabled: boolean) => {
      this.log({
        type: 'subscribers',
        channel,
        enabled
      });
    });


    this.tmiClient.on('vips', (channel: string, vips: string[]) => {
      this.log({
        type: 'vips',
        channel,
        vips
      });
    });
  }
}

interface TwitchEventOptions {
  amount: number
}
