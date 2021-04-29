import {Injectable, ProviderScope, ProviderType, UseOpts} from "@tsed/di";
import {NamedLogger} from "./named-logger";
import {TwitchConnector} from "./twitch.connector";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON
})
export class TwitchLogger {
  constructor(
    @UseOpts({name: 'TwitchLogger'}) private logger: NamedLogger,
    private _twitchConnector: TwitchConnector
  ) {
    logger.customFile({
      name: 'twitch',
      date: true,
    });

    _twitchConnector
      .twitchEvents$()
      .subscribe(value => {
        logger.info(value);
      });
  }
}
