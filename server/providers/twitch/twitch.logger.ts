import {Injectable, ProviderScope, ProviderType, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";
import {TwitchQueueEventBus} from "./twitch-queue-event.bus";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON
})
export class TwitchLogger {
  private _logEnabled = false;

  constructor(
    @UseOpts({name: 'TwitchLogger'}) private logger: NamedLogger,
    private twitchEventBus: TwitchQueueEventBus,

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


    twitchEventBus
      .AllQueuedEvents$
      .subscribe(value => {
        if (this._logEnabled) {
          logger.info(value);
        }
      });
  }

  public log(data: any) {
    if (this._logEnabled) {
      this.logger.info(data);
    }
  }

  public error(data: any) {
    if (this._logEnabled) {
      this.logger.error(data);
    }
  }
}
