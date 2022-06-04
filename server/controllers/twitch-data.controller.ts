import {Controller, Get, Inject, PathParams, QueryParams} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence, TOKEN_EXISTS_MARKER} from "../persistence";
import {ChannelPointRedemption, ENDPOINTS, TwitchAuthInformation} from "@memebox/contracts";
import {TwitchDataProvider} from "../providers/twitch/twitch.data-provider";

@Controller(ENDPOINTS.TWITCH_DATA.PREFIX)
export class TwitchDataController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private _dataProvider: TwitchDataProvider
  ) {
  }


  @Get(ENDPOINTS.TWITCH_DATA.HELIX+'/*')
  getHelixData(
    @PathParams() rawEndpoint: Record<number, string>,
    @QueryParams() params: Record<string, unknown>
  ): Promise<unknown> {
    const endpoint = Object.values(rawEndpoint)?.[0] ?? '';

    const queryArguments = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return this._dataProvider.getHelixDataAsync(
      `${endpoint}?${queryArguments}`
    );
  }


  @Get(ENDPOINTS.TWITCH_DATA.AUTH_INFORMATIONS)
  async getTwitchAuthInformations(): Promise<TwitchAuthInformation[]> {
    const [twitchAuth, botAuth] = await Promise.all([
      this._dataProvider.getMainTwitchAuthAsync(),
      this._dataProvider.getBotTwitchAuthAsync()
    ]);

    const result: TwitchAuthInformation[] = [];

    if (twitchAuth) {
      result.push({
        type: 'main',
        authResult: {
          ...twitchAuth,
          token: twitchAuth.token ? TOKEN_EXISTS_MARKER : ''
        }
      });
    }

    if (botAuth) {
      result.push({
        type: 'bot',
        authResult: {
          ...botAuth,
          token: botAuth.token ? TOKEN_EXISTS_MARKER : ''
        },
      });
    }

    return result;
  }

  @Get(ENDPOINTS.TWITCH_DATA.CHANNEL_POINT_LIST)
  async listCurrentChannelPointRedemptions(): Promise<ChannelPointRedemption[]> {
    const twitchAuth = await this._dataProvider.getMainTwitchAuthAsync();

    if (twitchAuth === null) {
      return [];
    }

    const channelRewardsResult = await this._dataProvider.getHelixDataAsync<ChannelPointRedemption[]>(
      `channel_points/custom_rewards?broadcaster_id=${twitchAuth.userId}`
    );

    const channelRewards  = channelRewardsResult.data;

    return channelRewards?.filter(cr => cr.is_enabled) ?? [];
  }

}
