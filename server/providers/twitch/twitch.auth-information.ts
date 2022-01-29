import {Service} from "@tsed/di";
import fetch from "node-fetch";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";
import {TwitchAuthResult} from "@memebox/contracts";


@Service()
export class TwitchAuthInformationProvider {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
  ) {
  }

  public getTwitchAuthAsync (): Promise<TwitchAuthResult|null> {
    const currentTwitchConfig =  this._persistence.getConfig(false).twitch;

    if (!currentTwitchConfig?.token) {
      return null;
    }

    return TwitchAuthInformationProvider.getTwitchTokenAuthAsync(currentTwitchConfig.token);
  }

  public getBotAuthAsync (): Promise<TwitchAuthResult|null> {
    const fullConfig = this._persistence.getConfig(false);

    const currentTwitchConfig =  fullConfig.twitch?.bot?.auth;

    if (!currentTwitchConfig?.token) {
      return null;
    }

    return TwitchAuthInformationProvider.getTwitchTokenAuthAsync(currentTwitchConfig.token);
  }

  private static async getTwitchTokenAuthAsync (token: string): Promise<TwitchAuthResult|null> {
    const password = token.replace( "oauth:", "" );

    const validation = await fetch( "https://id.twitch.tv/oauth2/validate", {
      headers: {
        "Authorization": `Bearer ${password}`
      }
    }).then( r => r.json() );

    return {
      valid: !validation.status,
      reason: validation.message,
      clientId: validation.client_id,
      userId: validation.user_id,
      token: password,
      expires_in: validation.expires_in,
      expires_in_date: Date.now() + (validation.expires_in * 1000),
      login: validation.login,
      scopes: validation.scopes
    }
  }
}
