import {Opts} from "@tsed/common";
import {Logger} from "@tsed/logger";
import {Injectable} from "@tsed/di";
import {LOG_PATH} from "../path.utils";

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

  info(...data: unknown[]) {
    this.logger.info(...data);
  }

  customFile(param: { date: boolean; name: string }) {
    this.logger.appenders.delete('file');

    const TODAY_LOG_SUFFIX = `.${ new Date().toISOString().slice(0,10) }`;


    // todo maybe extract this and from server.tsed.ts
    this.logger.appenders.set("file", {
      type: "file",
      // pattern not working so we added DateFormat ourselves
      filename: `${LOG_PATH}/${param.name}_tsed${param.date ?  TODAY_LOG_SUFFIX : ''}.log`,
      // pattern: '.yyyy-MM-dd',
      layout:{
        type: "json",
        separator: ","
      }
    })
  }

  error(...data: unknown[]) {
    this.logger.error(...data);
  }

}
