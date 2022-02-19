import {
  Config,
  ENDPOINTS,
  ObsConfig,
  Response,
  TWITCH_CLIENT_ID,
  TwitchConfig,
  TwitchConnectionType
} from "@memebox/contracts";
import {allowedFileUrl} from "../validations";
import {existsSync} from "fs";
import {sep} from 'path';
import {BodyParams, Controller, Delete, Get, Inject, PathParams, Put} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";
import fetch from "node-fetch";
import {URLSearchParams} from 'url';
import {UseOpts} from "@tsed/di";
import {NamedLogger} from "../providers/named-logger";


// TODO allow config generic put endpoint
// todo validations

@Controller(ENDPOINTS.CONFIG.PREFIX)
export class ConfigController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,

    @UseOpts({name: 'ConfigController'}) public logger: NamedLogger,
  ) {
  }

  @Get('/')
  getConfig(): Config {
    return this._persistence.getConfig();
  }

  @Put(ENDPOINTS.CONFIG.TWITCH)
  updateTwitchConfig(
    @BodyParams() twitchConfigBody: TwitchConfig
  ): Response {
    this._persistence.updateTwitchConfig(twitchConfigBody);

    return {
      ok: true
    };
  }

  @Put(ENDPOINTS.CONFIG.OBS)
  updateObsConfig(
    @BodyParams() obsConfigPayload: ObsConfig
  ): Response {
    this._persistence.updateObsConfig(obsConfigPayload);

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

  @Put(ENDPOINTS.CONFIG.CUSTOM_PORT)
  updatePort(
    @BodyParams('newPort') newPort: string
  ): Response {
    this._persistence.updateCustomPort(+newPort);

    return {
      ok: true
    };
  }


  @Delete(`${ENDPOINTS.CONFIG.TWITCH_REVOKE}:authType`)
  async revokeToken(
    @PathParams("authType") authType: TwitchConnectionType
  ): Promise<Response> {
    const config = this._persistence.getConfig(false);
    const targetToken = authType === 'MAIN'
      ? config.twitch.token
      : config.twitch.bot.auth.token;

    const params = new URLSearchParams();
    params.append('client_id', TWITCH_CLIENT_ID);
    params.append('token', targetToken);

    // call the revoke functions
    const result = await fetch( "https://id.twitch.tv/oauth2/revoke", {
      method: 'POST',
      body: params
    });

    if (result.status !== 200) {
      this.logger.error(`Unable to revoke the Twitch-Token: ${result.status}`);
    }

    // reset the token value
    if (authType === 'MAIN') {
      config.twitch.token = null;
    } else {
      config.twitch.bot.auth.token = null;
    }

    // save
    this._persistence.updateConfig(config);

    return {
      ok: true
    };
  }
}

