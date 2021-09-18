import {Controller, Get, Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";
import {ChannelPointRedemption, ENDPOINTS, TwitchAuthInformation, TwitchAuthResult} from "@memebox/contracts";
import fetch from "node-fetch";
import {TwitchAuthInformationProvider} from "../providers/twitch/twitch.auth";

@Controller(`/${ENDPOINTS.TWITCH_DATA.PREFIX}`)
export class TwitchDataController {

  private _savedMainTwitchAuth: TwitchAuthResult|null = null;
  private _savedBotTwitchAuth: TwitchAuthResult|null = null;

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
     private twitchAuth: TwitchAuthInformationProvider
  ) {
  }

  @Get(ENDPOINTS.TWITCH_DATA.AUTH_INFORMATIONS)
  async getTwitchAuthInformations(): Promise<TwitchAuthInformation[]> {
    const [twitchAuth, botAuth] = await Promise.all([
      this._getMainTwitchAuth(),
      this._getBotTwitchAuth()
    ]);

    const result: TwitchAuthInformation[] = [];

    if (twitchAuth) {
      result.push({
        type: 'main',
        authResult: twitchAuth
      });
    }

    if (botAuth) {
      result.push({
        type: 'bot',
        authResult: botAuth
      });
    }

    return result;
  }

  @Get(ENDPOINTS.TWITCH_DATA.CHANNEL_POINT_LIST)
  async listCurrentChannelPointRedemptions(): Promise<ChannelPointRedemption[]> {
    const twitchAuth = await this._getMainTwitchAuth();

    if (twitchAuth === null) {
      return [];
    }

    const channelRewardsUrl = ` https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this._savedMainTwitchAuth.userId}`;

    const channelRewardsResult = await fetch(channelRewardsUrl, {
      headers: {
        "Client-ID": twitchAuth.clientId,
        "Authorization": `Bearer ${twitchAuth.token}`
      }
    }).then( r => r.json() );

    const channelRewards: ChannelPointRedemption[] = channelRewardsResult.data;

    return channelRewards.filter(cr => cr.is_enabled);
  }

  private async _getMainTwitchAuth(): Promise<TwitchAuthResult|null> {
    if (this._savedMainTwitchAuth === null) {
      this._savedMainTwitchAuth = await this.twitchAuth.getTwitchAuthAsync();
    }

    return this._savedMainTwitchAuth;
  }

  private async _getBotTwitchAuth(): Promise<TwitchAuthResult|null> {
    if (this._savedBotTwitchAuth === null) {
      this._savedBotTwitchAuth = await this.twitchAuth.getBotAuthAsync();
    }

    return this._savedBotTwitchAuth;
  }
}
