import * as tmi from 'tmi.js';
import {ChatUserstate, Options, SubMethods, Userstate} from 'tmi.js';
import {debounceTime, startWith} from 'rxjs/operators';
import {
  TWITCH_BOT_RESPONSE_CONSTS,
  TwitchBanEvent,
  TwitchChannelPointRedemptionEvent,
  TwitchChatMessage,
  TwitchCheerMessage,
  TwitchConfig,
  TwitchConnectionType,
  TwitchEventTypes,
  TwitchGiftEvent,
  TwitchRaidedEvent,
  TwitchSubEvent,
  TwitchTrigger,
  TwitchTriggerCommand
} from '@memebox/contracts';
import {Service, UseOpts} from "@tsed/di";
import {Inject} from "@tsed/common";
import {isAllowedToTrigger} from "./twitch.utils";
import {Persistence} from "../../persistence";
import {PERSISTENCE_DI} from "../contracts";
import {NamedLogger} from "../named-logger";
import {getLevelOfTags} from "./twitch.functions";

import {PubSubClient} from '@twurple/pubsub';
import {StaticAuthProvider} from "@twurple/auth";

import {TwitchAuthInformationProvider} from "./twitch.auth-information";
import {TwitchQueueEventBus} from "./twitch-queue-event.bus";
import {ConnectionsStateHub, UpdateStateFunc} from "../connections-state.hub";


@Service()
export class TwitchConnector {
  private tmiReadOnlyClient: tmi.Client;
  private tmiMainClient: tmi.Client;
  private tmiBotClient: tmi.Client;
  private tmiConnected: {[key: string]: boolean} = {};
  private _twitchBotEnabled = false;
  private _currentTwitchConfig: TwitchConfig;


  private tmiReadOnlyState: UpdateStateFunc;
  private tmiPubSubState: UpdateStateFunc;

  public twitchSettings: TwitchTrigger[] = [];

  constructor(
    // currently the twitch config is inside the Persistence,
    // once there is some other "config" layer,
    // then it'll be replaced
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,

    @UseOpts({name: 'TwitchConnector'}) private logger: NamedLogger,

    private twitchAuth: TwitchAuthInformationProvider,
    private twitchEventBus: TwitchQueueEventBus,
    private connectionStateHub: ConnectionsStateHub,
  ) {
    this.tmiReadOnlyState = this.connectionStateHub.registerService({
      name: 'TMI Readonly Connection'
    });
    this.tmiPubSubState = this.connectionStateHub.registerService({
      name: 'TMI PubSub Connection'
    });


    // TODO better way to find out the config has changed
    let currentConfigJsonString = "";

    _persistence.dataUpdated$()
      .pipe(
        debounceTime(600),
        startWith(true)
      )
      .subscribe(() => {
        const config = _persistence.getConfig(false);
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

          this.log(`Creating the TwitchHandler for: ${config.twitch.channel}`);

          this.disconnect();

          this._currentTwitchConfig = twitchConfig;

          this.tmiReadOnlyClient = tmi.Client(this.createBaseTmiConfig());

          this.connectAndListenTMI();
          this.connectAndListenPubSub();
        }
      });
  }

  public availableConnectionTypes (): TwitchConnectionType[] {
    const types: TwitchConnectionType[] = [];

    if (this._currentTwitchConfig.token) {
      types.push('MAIN');
    }

    if (this.hasBotToken()) {
      types.push('BOT');
    }

    return types;
  }

  public async getTmiWriteInstance(type: TwitchConnectionType|null = null) : Promise<tmi.Client> {
    if (type === null) {
      const availableTypes = this.availableConnectionTypes();

      if (availableTypes.length === 0) {
        throw Error('No Twitch Accounts added');
      }

      // prefer bot
      if (availableTypes.includes('BOT')) {
        type = 'BOT';
      } else if (availableTypes.includes('MAIN')) {
        type = 'MAIN';
      }
    }

    const client = type === 'BOT'
      ? (this.tmiBotClient ?? (this.tmiBotClient = this.createTmiConnection('BOT')))
      : (this.tmiMainClient ?? (this.tmiMainClient = this.createTmiConnection('MAIN')));

    if (!this.tmiConnected[type]) {
      await client.connect();
      this.tmiConnected[type] = true;
    }

    return client;
  }

  public getTwitchSettings (){
    return this._currentTwitchConfig;
  }

  public disconnect(): void  {
    this.tmiReadOnlyClient?.disconnect();
    this.tmiMainClient?.disconnect();
    this.tmiBotClient?.disconnect();

    this.tmiMainClient = null;
    this.tmiBotClient = null;
  }

  private createBaseTmiConfig (): Options {
    const tmiConfig: Options = {
      options: {
        skipUpdatingEmotesets: true,
      },
      //options: {debug: true},
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [this._currentTwitchConfig.channel]
    };

    return tmiConfig;
  }

  private createTmiConnection (type: TwitchConnectionType): tmi.Client {
    const tmiConfig = this.createBaseTmiConfig();

    if (type === 'MAIN') {
      if(this._currentTwitchConfig.token) {
        tmiConfig.identity = {
          username: this._currentTwitchConfig.channel,
          password: this._currentTwitchConfig.token
        };
      } else {
        throw Error('There is no token for the Main Twitch Account');
      }
    }

    if (type === 'BOT') {
      if (this.hasBotToken()) {
        tmiConfig.identity = {
          username: this._currentTwitchConfig.bot.auth.name,
          password: this._currentTwitchConfig.bot.auth.token
        };
      } else {
        throw Error('There is no token for the Bot Twitch Account');
      }
    }

    return tmi.Client(tmiConfig);
  }

  private hasBotToken () {
    return this._currentTwitchConfig.bot?.enabled
      && this._currentTwitchConfig.bot?.auth?.name
      && this._currentTwitchConfig.bot?.auth?.token;
  }

  private async connectAndListenTMI() {
    for (let tryOut = 0; tryOut < 3; tryOut++) {
      try {
        this.tmiReadOnlyState({
          label: 'Connecting'
        });
        await this.tmiReadOnlyClient.connect();
        this.log({
          message: 'Connected to Twitch!'
        });

        this.tmiReadOnlyState({
          label: 'Connected'
        });
        break;
      } catch (ex) {
        this.error({
          ex,
          message: `Error trying to connect to twitch - ${ex.message}`
        });

        this.tmiReadOnlyState({
          label: "Can't connect to Twitch",
          description: ex.message
        });
      }
    }

    this.tmiReadOnlyClient.on('message', (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
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

      this.twitchEventBus.queueEvent(twitchEvent);

      // This is the bot handler, nothing after that needs to be handled
      if (this._twitchBotEnabled && message === (this._currentTwitchConfig.bot?.command ?? TWITCH_BOT_RESPONSE_CONSTS.DEFAULT_COMMANDS_TEXT)) {
        this.handleCommandsRequest(userstate);

        return false;
      }
    });

    this.tmiReadOnlyClient.on('cheer', (channel: string, userstate: ChatUserstate, message: string) => {
      const twitchEvent = new TwitchCheerMessage({
        channel,
        message,
        userstate,
      });

      this.twitchEventBus.queueEvent(twitchEvent);
    });

    this.tmiReadOnlyClient.on('raided', (channel: string, username: string, viewers: number) => {
      this.twitchEventBus.queueEvent(new TwitchRaidedEvent({
        channel, username, viewers
      }));
    });

    //Reason is being returned as null even when one is provided when banning someone
    this.tmiReadOnlyClient.on('ban', (channel: string, username:string, reason:string) => {
      this.twitchEventBus.queueEvent(new TwitchBanEvent({
        username, reason
      }));
    });

    this.tmiReadOnlyClient.on('anongiftpaidupgrade', (channel: string, username: string, userState: Userstate) => {
      const twitchSubEvent = new TwitchSubEvent({
        username,
        userState,

        methods: null,
        message: '',
        months: 1,
        shouldShareStreak: false,
        cumulativeMonths: 1,
        gifter: null,
        subtype: "anongiftpaidupgrade"
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });

    this.tmiReadOnlyClient.on('giftpaidupgrade', (channel: string, username: string, sender: string, userState: Userstate) => {
      const twitchSubEvent = new TwitchSubEvent({
        username,
        userState,

        methods: null,
        message: '',
        months: 1,
        shouldShareStreak: false,
        cumulativeMonths: 1,
        gifter: sender,
        subtype: "giftpaidupgrade"
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });

    this.tmiReadOnlyClient.on('resub', (channel: string, username: string, months: number, message: string, userState: Userstate, methods : SubMethods) => {
      const twitchSubEvent = new TwitchSubEvent({
        username,
        userState,

        methods,
        message,
        months,
        shouldShareStreak: userState["msg-param-should-share-streak"],
        cumulativeMonths: ~~userState["msg-param-cumulative-months"],
        gifter: null,
        subtype: "resub"
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });

    this.tmiReadOnlyClient.on('subgift', (channel: string, username:string, months:number, recipient: string, methods : SubMethods, userState: Userstate) => {
      const twitchSubEvent = new TwitchGiftEvent({
        gifter: username,
        userState,

        methods,
        subtype: "subgift",
        streakMonths: months,
        gifts: months,
        recipientId: userState["msg-param-recipient-id"],
        recipientUserName: recipient,
        recipientDisplayName: userState["msg-param-recipient-display-name"],
        totalGifts: ~~userState["msg-param-sender-count"]
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });

    this.tmiReadOnlyClient.on('submysterygift', (channel: string, username: string, numberOfSubs: number, methods: SubMethods, userState: Userstate) => {
      const twitchSubEvent = new TwitchGiftEvent({
        gifter: username,
        userState,

        methods,
        gifts: numberOfSubs,
        subtype: "submysterygift",
        streakMonths: 0,
        recipientId: null,
        recipientUserName: null,
        recipientDisplayName: null,
        totalGifts: ~~userState["msg-param-sender-count"]
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });

    this.tmiReadOnlyClient.on('subscription', (channel: string, username: string, methods: SubMethods, message: string, userState: Userstate) => {
      const twitchSubEvent = new TwitchSubEvent({
        username,
        userState,

        methods,
        message,
        months: 1,
        shouldShareStreak: false,
        cumulativeMonths: 1,
        gifter: null,
        subtype: "subscription"
      });

      this.twitchEventBus.queueEvent(twitchSubEvent);
    });
  }

  private async connectAndListenPubSub() {
    const twitchAuth = await this.twitchAuth.getTwitchAuthAsync();

    if (!twitchAuth) {
      this.tmiPubSubState({
        label: 'No Auth'
      });

      return;
    }

    if (!twitchAuth.valid) {
      this.tmiPubSubState({
        label: 'Invalid Auth Token'
      });
      return;
    }

    this.tmiPubSubState({
      label: 'Connecting'
    });

    const authProvider = new StaticAuthProvider(twitchAuth.clientId, twitchAuth.token);

    const pubSubClient = new PubSubClient();
    const userId = await pubSubClient.registerUserListener(authProvider);

    this.tmiPubSubState({
      label: 'Connected'
    });


    pubSubClient.onRedemption(userId, channelPointRedemption => {

      // Extracting all properties because of the channelPointRedemption overrides the toString and with that the object
      // cant be logged

      const {
        id,
        message,
        redemptionDate,
        rewardId,
        rewardTitle,
        rewardPrompt,
        rewardCost,

        userId,
        userName,
        userDisplayName
      } = channelPointRedemption;

      this.twitchEventBus.queueEvent(new TwitchChannelPointRedemptionEvent({
        message,
        redemptionDate,
        rewardId,
        rewardName: rewardTitle,
        rewardCost,
        userId,
        userName,
        userDisplayName
      }));
    });
  }

  async handleCommandsRequest(tags: tmi.ChatUserstate): Promise<void> {
    const availableConnectionTypes = this.availableConnectionTypes();

    if (availableConnectionTypes.length == 0) {
      return;
    }

    const foundLevels = getLevelOfTags(tags);
    const commands = this.twitchSettings.filter((event) => {
      const trigger: TwitchTriggerCommand = {command: event, tags};

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
    const botResponse = (this._currentTwitchConfig.bot.response || TWITCH_BOT_RESPONSE_CONSTS.DEFAULT_COMMANDS_TEXT)
      .replace(TWITCH_BOT_RESPONSE_CONSTS.COMMANDS, commands.join(' | '))
      .replace(TWITCH_BOT_RESPONSE_CONSTS.USER, `${tags.username}`);

    const tmiWrite = await this.getTmiWriteInstance();
    await tmiWrite.ping().catch(() => tmiWrite.connect());
    tmiWrite.say(this._currentTwitchConfig.channel, botResponse)
      .catch(ex => this.error(ex));
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
