import jwtDecode from 'jwt-decode';

export interface TwitchLoginPayload {
  userId: string;
  userName: string;
  tokenId: string;
  accessToken: string;
}

export class TwitchOAuthHandler {
  private twitchAuthUrl: string;

  constructor (private clientId: string,
               private scopes: string,
               private redirectUrl: string,
               forceVerify: boolean) {
    const queryParams = [
      'response_type=token%20id_token',
      `client_id=${this.clientId}`,
      `redirect_uri=${encodeURIComponent(this.redirectUrl)}`,
      `scope=${this.scopes}+openid`
    ];

    if (forceVerify) {
      queryParams.push('force_verify=true')
    }

    this.twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?${queryParams.join('&')}`;
  }

  async login (): Promise<TwitchLoginPayload> {
    return new Promise((resolve, reject) => {
      window.open(this.twitchAuthUrl, 'Twitch Auth', 'toolbar=0,scrollbars=1,status=1,resizable=1,location=no,menuBar=0');

      (window as any).gotToken = function (userName: string, userId: string, tokenId: string, accessToken: string) {
        resolve({
          userName, userId, tokenId, accessToken
        });
      };
    });
  }
}


export function checkToken(): boolean {
  const hashValues = location.hash.replace('#', '');

  const params = new URLSearchParams(hashValues);

  const tokenId = params.get('id_token');
  const accessToken = params.get('access_token');

  if (!tokenId) {
    return false;
  }

  const jwt = jwtDecode(tokenId);

  const {preferred_username: userName, sub: userId} = jwt as any;

  setTimeout(() => {
    window.opener.gotToken(userName, userId, tokenId, accessToken);
    window.close();
  }, 4000);

  return true;
}
