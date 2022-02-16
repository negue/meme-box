import {TwitchConnector} from "../../../twitch/twitch.connector";
import {DisposableBase} from "./disposableBase";
import {takeUntil} from "rxjs/operators";
import {ActionType, TwitchConnectionType} from "@memebox/contracts";
import {TwitchDataProvider} from "../../../twitch/twitch.data-provider";
import {TwitchQueueEventBus} from "../../../twitch/twitch-queue-event.bus";

export class TwitchApi extends DisposableBase {

  // for permanent scripts
  public onEvent$ = this.twitchEventBus.AllQueuedEvents$.pipe(
    takeUntil(this._destroy$)
  );

  constructor(
    private twitchConnector: TwitchConnector,
    private twitchEventBus: TwitchQueueEventBus,
    private dataProvider: TwitchDataProvider,
    private scriptType: ActionType
  ) {
    super();

    // Only Permanent Scripts as allowed to subscribe to Events
    if (scriptType === ActionType.Script) {
      this._destroy$.next();
    }
  }

  public async say(message: string, type: TwitchConnectionType|null = null) : Promise<void> {
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

  public postHelixDataAsync(endpointAndQuery: string, bodyData: unknown) {
    return this.dataProvider.postHelixDataAsync(endpointAndQuery, bodyData);
  }

  public patchHelixDataAsync(endpointAndQuery: string, bodyData: unknown) {
    return this.dataProvider.patchHelixDataAsync(endpointAndQuery, bodyData);
  }
}
