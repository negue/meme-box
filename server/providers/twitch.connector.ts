import * as tmi from 'tmi.js';
import {ChatUserstate, Options} from 'tmi.js';
import {Observable, Subject} from 'rxjs';
import {debounceTime, startWith} from 'rxjs/operators';
import {Twitch, TwitchConfig, TwitchEventTypes, TwitchTriggerCommand} from '@memebox/contracts';
import {Logger} from 'winston';
import {Service} from "@tsed/di";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {Persistence} from "../persistence";
import {LOGGER, newLogger} from "../logger.utils";
import {getLevelOfTags} from "../twitch.functions";
import {TwitchChatMessage, TwitchCheerMessage, TwitchEvent, TwitchRaidedEvent} from "./twitch.connector.types";
import {isAllowedToTrigger} from "./twitch.utils";

@Service()
export class TwitchConnector {
  private tmiClient: tmi.Client;
  private twitchSettings: Twitch[] = [];
  private logger: Logger;
  private _receivedTwitchEvents = new Subject<TwitchEvent>();
  private _twitchBotEnabled = false;
  private _currentTwitchConfig: TwitchConfig;

  constructor(
    // currently the twitch config is inside the Persistence,
    // once there is some other "config" layer,
    // then it'll be replaced
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
    // TODO better way to find out the config has changed
    let currentConfigJsonString = "";

    _persistence.dataUpdated$()
      .pipe(
        debounceTime(600),
        startWith(true)
      )
      .subscribe(() => {
        const config = _persistence.getConfig();
        const jsonOfConfig = JSON.stringify(config.twitch);

        const twitchConfig = config.twitch;

        if (!twitchConfig) {
          return;
        }

        this.log({
          message: 'Data Updated got the new events'
        });

        this.twitchSettings = _persistence.listTwitchEvents();
        this._twitchBotEnabled = twitchConfig.bot?.enabled && !!twitchConfig.bot.auth;

        if (currentConfigJsonString !== jsonOfConfig
          && !!config.twitch?.channel
        ) {
          currentConfigJsonString = jsonOfConfig;

          LOGGER.info(`Creating the TwitchHandler for: ${config.twitch.channel}`);

          this.disconnect();

          this._currentTwitchConfig = twitchConfig;


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
            // will be removed once refactor is done
            this.createLogger();
          }

          this.connectAndListen();
        }
      });
  }

  public twitchEvents$(): Observable<TwitchEvent> {
    return this._receivedTwitchEvents.asObservable();
  }

  public disconnect() {
    this.tmiClient?.disconnect();
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

    this.tmiClient.on('message', (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
      // todo remove?
      if (self) {
        return;
      }

      const twitchEvent = new TwitchChatMessage({
        channel,
        self,
        message,
        userstate
      });

      this._receivedTwitchEvents.next(twitchEvent);

      // This is the bot handler, nothing after that needs to be handled
      if (this._twitchBotEnabled && message === '!commands') {
        this.handleCommandsRequest(userstate, message);

        return false;
      }
    });

    this.tmiClient.on('cheer', (channel: string, userstate: ChatUserstate, message: string) => {
      const twitchEvent = new TwitchCheerMessage({
        channel,
        message,
        userstate,
      });

      this._receivedTwitchEvents.next(twitchEvent);
    });

    this.tmiClient.on('raided', (channel: string, username: string, viewers: number) => {
      this._receivedTwitchEvents.next(new TwitchRaidedEvent({
        channel, username, viewers
      }));
    });
  }

  handleCommandsRequest(tags: tmi.ChatUserstate, message: string): void {
    const foundLevels = getLevelOfTags(tags);
    const commands = this.twitchSettings.filter((event) => {
      const trigger: TwitchTriggerCommand = {message, command: event, tags};

      return (
        event.event === TwitchEventTypes.message &&
        event.contains.startsWith('!') &&
        event.active &&
        isAllowedToTrigger(
          trigger,
          foundLevels
        )
      );
    }).map(e => e.contains);

    const botResponse = this._currentTwitchConfig.bot.response
      .replace('{{commands}}', commands.join(' | '))
      .replace('{{user}}', `${tags.username}`);
    this.tmiClient.say(this._currentTwitchConfig.channel, botResponse)
      .catch(console.error);
  }

  private createLogger() {
    this.logger = newLogger('Twitch', 'twitch');
  }

  private log(data: any) {
    if (this._currentTwitchConfig?.enableLog) {
      this.logger.info(data);
    }
  }

  private error(data: any) {
    if (this._currentTwitchConfig?.enableLog) {
      this.logger.error(data);
    }
  }
}
