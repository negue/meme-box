import {Service} from "@tsed/di";
import fetch from "node-fetch";
import {TwitchAuthResult} from "@memebox/contracts";
import {TwitchAuthInformationProvider} from "./twitch.auth-information";
import {Persistence} from "../../persistence";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";

export interface TwitchHelixResult<TResult> {
  data?: TResult;
  ok?: boolean;
  message?: string;
}

// TODO Refactor Boilerplate

@Service()
export class TwitchDataProvider {

  private _savedMainTwitchAuth: TwitchAuthResult|null = null;
  private _savedBotTwitchAuth: TwitchAuthResult|null = null;

  constructor(
    private twitchAuth: TwitchAuthInformationProvider,
    @Inject(PERSISTENCE_DI) persistence: Persistence
  ) {
    persistence.dataUpdated$().subscribe(
      changed => {
        if (["everything", "twitch-setting"].includes(changed.dataType)) {
          this._savedMainTwitchAuth = null;
          this._savedBotTwitchAuth = null;
        }
      }
    )
  }

  async getHelixDataAsync<TResult>(
    endpoint: string
  ): Promise<TwitchHelixResult<TResult>> {
    const twitchAuth = await this.getMainTwitchAuthAsync();

    if (twitchAuth === null) {
      return {
        ok: false,
        message: 'Not authorized.'
      };
    }
    const apiURL = `https://api.twitch.tv/helix/${endpoint}`;

    const result = await fetch(apiURL, {
      headers: {
        "Client-ID": twitchAuth.clientId,
        "Authorization": `Bearer ${twitchAuth.token}`
      }
    }).then( r => r.json() );

    return result;
  }

  async postHelixDataAsync<TResult>(
    endpoint: string,
    body: unknown
  ): Promise<TwitchHelixResult<TResult>> {
    const twitchAuth = await this.getMainTwitchAuthAsync();

    if (twitchAuth === null) {
      return {
        ok: false,
        message: 'Not authorized.'
      };
    }
    const apiURL = `https://api.twitch.tv/helix/${endpoint}`;

    const request = await fetch(apiURL, {
      headers: {
        "Client-ID": twitchAuth.clientId,
        "Authorization": `Bearer ${twitchAuth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (request.status === 204) {
      return {};
    }

    const result = request.body.readable
      ? await request.json()
      : {};

    return result;
  }

  async deleteHelixDataAsync<TResult>(
    endpoint: string
  ): Promise<TwitchHelixResult<TResult>> {
    const twitchAuth = await this.getMainTwitchAuthAsync();

    if (twitchAuth === null) {
      return {
        ok: false,
        message: 'Not authorized.'
      };
    }
    const apiURL = `https://api.twitch.tv/helix/${endpoint}`;

    const request = await fetch(apiURL, {
      headers: {
        "Client-ID": twitchAuth.clientId,
        "Authorization": `Bearer ${twitchAuth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    });

    if (request.status === 204) {
      return {};
    }

    const result = request.body.readable
      ? await request.json()
      : {};

    return result;
  }


  async patchHelixDataAsync<TResult>(
    endpoint: string,
    body: unknown
  ): Promise<TwitchHelixResult<TResult>> {
    const twitchAuth = await this.getMainTwitchAuthAsync();

    if (twitchAuth === null) {
      return {
        ok: false,
        message: 'Not authorized.'
      };
    }
    const apiURL = `https://api.twitch.tv/helix/${endpoint}`;

    const result = await fetch(apiURL, {
      headers: {
        "Client-ID": twitchAuth.clientId,
        "Authorization": `Bearer ${twitchAuth.token}`,
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify(body)
    }).then(response => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json()
      } else {
        return response.text()
      }
    });

    return result;
  }

  public async getMainTwitchAuthAsync(): Promise<TwitchAuthResult|null> {
    if (this._savedMainTwitchAuth === null) {
      this._savedMainTwitchAuth = await this.twitchAuth.getTwitchAuthAsync();
    }

    return this._savedMainTwitchAuth;
  }

  public async getBotTwitchAuthAsync(): Promise<TwitchAuthResult|null> {
    if (this._savedBotTwitchAuth === null) {
      this._savedBotTwitchAuth = await this.twitchAuth.getBotAuthAsync();
    }

    return this._savedBotTwitchAuth;
  }
}
