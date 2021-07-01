import {TwitchConnector} from "../../../twitch/twitch.connector";

export class TwitchApi {
  constructor(
    private twitchConnector: TwitchConnector
  ) {

  }

  public say(message: string) {
    const tmiInstance = this.twitchConnector.tmiInstance();
    const settings = this.twitchConnector.getTwitchSettings();

    tmiInstance.say(settings.channel, message);
  }
}
