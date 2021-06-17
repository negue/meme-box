import {
  Config,
  CONFIG_CUSTOM_PORT_PATH,
  CONFIG_TWITCH_BOT_INTEGRATION_PATH,
  CONFIG_TWITCH_BOT_PATH,
  CONFIG_TWITCH_CHANNEL_PATH,
  CONFIG_TWITCH_LOG_PATH,
  ENDPOINTS,
  Response,
  TwitchConfig
} from "@memebox/contracts";
import {allowedFileUrl} from "../validations";
import {existsSync} from "fs";
import {sep} from 'path';
import {BodyParams, Controller, Get, Inject, Put} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";


// TODO allow config generic put endpoint
// TODO Refactor this config boilerplate !!!
// todo validations

@Controller(`/${ENDPOINTS.CONFIG}`)
export class ConfigController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
  }

  @Get('/')
  getConfig(): Config {
    return this._persistence.getConfig();
  }

  @Put(CONFIG_TWITCH_CHANNEL_PATH)
  updateTwitchConfig(
    @BodyParams() twitchConfigBody: TwitchConfig
  ): Response {
    this._persistence.updateTwitchChannel(twitchConfigBody);

    return {
      ok: true
    };
  }


  @Put(CONFIG_TWITCH_LOG_PATH)
  updateTwitchLog(
    @BodyParams() twitchConfigBody: TwitchConfig
  ): Response {
    this._persistence.updateTwitchLog(twitchConfigBody.enableLog);

    return {
      ok: true
    };
  }


  @Put(CONFIG_TWITCH_BOT_INTEGRATION_PATH)
  updateTwitchBotEnabled(
    @BodyParams() twitchConfigBody: TwitchConfig
  ): Response {
    this._persistence.updateTwitchBotIntegration(twitchConfigBody.bot);

    return {
      ok: true
    };
  }


  @Put(CONFIG_TWITCH_BOT_PATH)
  updateTwitchBot(
    @BodyParams() twitchConfigBody: TwitchConfig
  ): Response {
    this._persistence.updateTwitchBot(twitchConfigBody);

    return {
      ok: true
    };
  }


  @Put()
  updateConfig(
    @BodyParams() partialConfig: Partial<Config>
  ): Response {

    const mediaFolder: string = partialConfig.mediaFolder;

    if (mediaFolder) {
      if (!allowedFileUrl(mediaFolder)) {
        return {ok: false};
      }

      if (!mediaFolder.includes(sep)) {
        return {ok: false};
      }

      if (!existsSync(mediaFolder)) {
        return {ok: false};
      }
    }

    // update config
    this._persistence.updatePartialConfig(partialConfig)

    return {
      ok: true
    };
  }

  @Put(CONFIG_CUSTOM_PORT_PATH)
  updatePort(
    @BodyParams('newPort') newPort: string
  ): Response {
    this._persistence.updateCustomPort(+newPort);

    return {
      ok: true
    };
  }

}

