import {TwitchConnector} from "../../../../../projects/triggers-twitch/src/lib/twitch.connector";
import {DisposableBase} from "./disposableBase";
import {takeUntil} from "rxjs/operators";
import {ActionType, TwitchAnnouncementColors, TwitchConnectionType} from "@memebox/contracts";
import {TwitchDataProvider} from "../../../twitch/twitch.data-provider";
import {TwitchQueueEventBus} from "../../../../../projects/triggers-twitch/src/lib/twitch-queue-event.bus";
import {randomElement} from "@memebox/utils";

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

  public async shoutout(username: string) : Promise<void> {
    const userId = await this.getUserIdByName(username);

    const broadcasterId = await this.getBroadcasterIdAsync();

    await this.postHelixDataAsync('chat/shoutouts',{
      from_broadcaster_id: broadcasterId,
      to_broadcaster_id: userId,
      moderator_id: broadcasterId
    });
  }

  public async getUserIdByName(username:string) : Promise<string> {
    const userResult = await this.getHelixDataAsync<{ id:string }[]>(`users?login=${username}`);

    return userResult.data[0].id;
  }

  public async getBroadcasterIdAsync(): Promise<string> {
    const mainAuth =  await this.dataProvider.getMainTwitchAuthAsync();

    return mainAuth?.userId;
  }

  public getHelixDataAsync<TResult>(endpointAndQuery: string) {
    return this.dataProvider.getHelixDataAsync<TResult>(endpointAndQuery);
  }

  public postHelixDataAsync(endpointAndQuery: string, bodyData: unknown) {
    return this.dataProvider.postHelixDataAsync(endpointAndQuery, bodyData);
  }

  public patchHelixDataAsync(endpointAndQuery: string, bodyData: unknown) {
    return this.dataProvider.patchHelixDataAsync(endpointAndQuery, bodyData);
  }

  public async sendAnnouncement(message: string, color?: string){
    const broadcasterId = await this.getBroadcasterIdAsync();

    if (color === 'random'){
      color = randomElement(TwitchAnnouncementColors).id;
    }

    return this.postHelixDataAsync(
      `chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${broadcasterId}`,
      {
        message,
        color
      }
    )
  }

  public async clearChat (){
    const broadcasterId = await this.getBroadcasterIdAsync();

    return this.dataProvider.deleteHelixDataAsync(
      `moderation/chat?broadcaster_id=${broadcasterId}&moderator_id=${broadcasterId}`
    );
  }

  // https://dev.twitch.tv/docs/api/reference#start-commercial
  public async startCommercial (length: 30| 60|90| 120|  150|  180){
    const broadcaster_id = await this.getBroadcasterIdAsync();

    return this.dataProvider.postHelixDataAsync(
      `channels/commercial`, {
        broadcaster_id,
        length
      }
    );
  }

  // https://dev.twitch.tv/docs/api/reference#create-stream-marker
  public async createMarker (){
    return this.dataProvider.postHelixDataAsync(
      `streams/markers`, {}
    );
  }

  // https://dev.twitch.tv/docs/api/reference#update-chat-settings
  public async updateChatSettings (chatSettings: {
    emote_mode?: boolean,
    follower_mode?: boolean,
    slow_mode?: boolean,
    subscriber_mode?: boolean,
    unique_chat_mode?: boolean
  }){
    const broadcasterId = await this.getBroadcasterIdAsync();

    return this.dataProvider.patchHelixDataAsync(
      `chat/settings?broadcaster_id=${broadcasterId}&moderator_id=${broadcasterId}`, chatSettings
    );
  }

}
