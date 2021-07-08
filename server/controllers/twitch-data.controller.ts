import {Controller, Get, Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";
import {ChannelPointRedemption, ENDPOINTS} from "@memebox/contracts";
import fetch from "node-fetch";
import {TwitchAuthInformation, TwitchAuthResult} from "../providers/twitch/twitch.auth";

@Controller(`/${ENDPOINTS.TWITCH_DATA}`)
export class TwitchDataController {

  private _savedTwitchAuth: TwitchAuthResult|null = null;

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
     private twitchAuth: TwitchAuthInformation
  ) {
  }

  @Get('/currentChannelPointRedemptions')
  async listCurrentChannelPointRedemptions(): Promise<ChannelPointRedemption[]> {
    if (this._savedTwitchAuth === null) {
      this._savedTwitchAuth = await this.twitchAuth.getTwitchAuthAsync();
    }

    if (this._savedTwitchAuth === null) {
      return [];
    }

    const channelRewardsUrl = ` https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this._savedTwitchAuth.userId}`;

    const channelRewardsResult = await fetch(channelRewardsUrl, {
      headers: {
        "Client-ID": this._savedTwitchAuth.clientId,
        "Authorization": `Bearer ${this._savedTwitchAuth.token}`
      }
    }).then( r => r.json() );

    const channelRewards: ChannelPointRedemption[] = channelRewardsResult.data;

    return channelRewards.filter(cr => cr.is_enabled);
  }
}
