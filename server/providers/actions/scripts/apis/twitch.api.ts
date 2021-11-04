import {TmiConnectionType, TwitchConnector} from "../../../twitch/twitch.connector";
import {DisposableBase} from "./disposableBase";
import {takeUntil} from "rxjs/operators";
import {ActionType} from "@memebox/contracts";
import {TwitchDataProvider} from "../../../twitch/twitch.data-provider";

export class TwitchApi extends DisposableBase {

  // for permanent scripts
  public onEvent$ = this.twitchConnector.twitchEvents$().pipe(
    takeUntil(this._destroy$)
  );

  constructor(
    private twitchConnector: TwitchConnector,
    private dataProvider: TwitchDataProvider,
    private scriptType: ActionType
  ) {
    super();

    // Only Permanent Scripts as allowed to subscribe to Events
    if (scriptType === ActionType.Script) {
      this._destroy$.next();
    }
  }

  public async say(message: string, type: TmiConnectionType|null = null) {
    if (type === null) {
      const availableTypes = this.twitchConnector.availableConnectionTypes();

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

    const tmiInstance = await this.twitchConnector.getTmiWriteInstance(type);
    const settings = this.twitchConnector.getTwitchSettings();

    tmiInstance.say(settings.channel, message);
  }

  public async getBroadcasterIdAsync(): Promise<string> {
    const mainAuth =  await this.dataProvider.getMainTwitchAuthAsync();

    return mainAuth?.userId;
  }

  public getHelixDataAsync(endpointAndQuery: string) {
    return this.dataProvider.getHelixDataAsync(endpointAndQuery);
  }
}
