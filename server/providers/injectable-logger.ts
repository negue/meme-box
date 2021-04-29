import {Opts} from "@tsed/common";
import {Logger} from "@tsed/logger";
import {Injectable} from "@tsed/di";

// TODO Logging to Files with tsed/logger instead of winston
// TODO add all other methods

@Injectable()
export class NamedLogger {
  private logger: Logger;

  constructor(@Opts options: {name: string} = {name: 'Logger'},
              loggerBase: Logger) {
    this.logger = new Logger(options.name);
    loggerBase.appenders.forEach((value, key) => {
      this.logger.appenders.set(key, value.config);
    })
  }

  warn(...data: unknown[]) {
    this.logger.warn(...data);
  }
}
