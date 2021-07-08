import {Service} from "@tsed/di";
import fetch from "node-fetch";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";

export interface TwitchAuthResult {
  clientId: string,
  userId: string,
  token: string
}

@Service()
export class TwitchAuthInformation {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
  ) {
  }

  public async getTwitchAuthAsync (): Promise<TwitchAuthResult> {
    const currentTwitchConfig =  this._persistence.getConfig(false).twitch;

    if (!currentTwitchConfig?.token) {
      return null;
    }

    const password = currentTwitchConfig.token.replace( "oauth:", "" );

    const validation = await fetch( "https://id.twitch.tv/oauth2/validate", {
      headers: {
        "Authorization": `OAuth ${password}`
      }
    }).then( r => r.json() );

    console.warn('Step 1', { validation });

    if( !validation.client_id
      || !validation.scopes.includes( "channel:read:redemptions" )
      // || !validation.scopes.includes( "user:read:email" )
    ) {
      console.error( "Invalid Password or Permission Scopes (channel:read:redemptions, user:read:email)" );
      return;
    }

    console.warn('Step 2', {
      // validation,
      // userInfo: userInfo.data[0]
    });

    return {
      clientId: validation.client_id,
      userId: validation.user_id,
      token: password
    }
  }
}
