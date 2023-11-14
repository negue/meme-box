import {Injectable, ProviderScope, ProviderType, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";

// skipcq: JS-0579
@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON
})
export class TwitchLogger {
  private _logEnabled = false;

  constructor(
    @UseOpts({name: 'TwitchLogger'}) private logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
  ) {

    if (_persistence.getConfig()?.twitch?.enableLog) {
      // will be removed once refactor is done
      logger.customFile({
        name: 'twitch',
        date: false,
        maxLogSize: 50
      });
      this._logEnabled = true;
    }
  }

  public log(data: any): void  {
    if (this._logEnabled) {
      this.logger.info(data);
    }
  }

  public error(data: any): void  {
    if (this._logEnabled) {
      this.logger.error(data);
    }
  }
}
