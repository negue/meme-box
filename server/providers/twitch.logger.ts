import {Injectable, ProviderScope, ProviderType, UseOpts} from "@tsed/di";
import {MyLogger} from "./injectable-logger";


@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON
})
export class TwitchLogger {
  constructor(
    @UseOpts({name: 'TwitchLogger'}) private logger: MyLogger
  ) {
    logger.warn('TEST IF TWITCHLOGGER IS CREATED ON STARTUP');
  }
}
