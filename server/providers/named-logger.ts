import {Opts} from "@tsed/common";
import {Logger} from "@tsed/logger";
import {Injectable} from "@tsed/di";
import {LOG_PATH} from "../path.utils";
import {BehaviorSubject} from "rxjs";
import {CLI_OPTIONS} from "../utils/cli-options";

// TODO add all other methods

export interface ErrorWithContext {
  error: Error | unknown;
  context: string;
}

@Injectable()
export class NamedLogger {
  public static NewestError$ = new BehaviorSubject<ErrorWithContext>(null);


  private logger: Logger;

  constructor(@Opts options: {name: string} = {name: 'Logger'}) {
    this.logger = new Logger(options.name);
    addDefaultLoggerAppenders(this.logger);
  }

  warn(...data: unknown[]) {
    this.logger.warn(...data);
  }

  info(...data: unknown[]) {
    this.logger.info(...data);
  }

  customFile(param: { date: boolean; name: string, maxLogSize?: number }) {
    this.logger.appenders.delete('file');

    const TODAY_LOG_SUFFIX = `.${ new Date().toISOString().slice(0,10) }`;


    // todo maybe extract this and from server.tsed.ts
    this.logger.appenders.set("file", {
      type: "file",
      // pattern not working so we added DateFormat ourselves
      filename: `${LOG_PATH}/${param.name}_tsed${param.date ?  TODAY_LOG_SUFFIX : ''}.log`,
      maxLogSize: param.maxLogSize,
      // pattern: '.yyyy-MM-dd',
      layout:{
        type: "json",
        separator: ","
      }
    })
  }

  error(error: Error|unknown, context?: string) {
    NamedLogger.NewestError$.next({
      error,
      context
    });

    this.logger.error(error, context);
  }

}

export function addDefaultLoggerAppenders (logger: Logger) {
  const TODAY_LOG_SUFFIX = new Date().toISOString().slice(0, 10);

  const jsonLayout = {
    type: "json",
    separator: ","
  };

  logger.appenders
    .set("stdout", {
      type: "stdout",
      levels: ["debug", "info", "trace"],
      layout: CLI_OPTIONS.STDOUT_AS_JSON ? jsonLayout : undefined
    })
    .set("stderr", {
      type: "stderr",
      levels: ["fatal", "error", "warn"],
      layout: CLI_OPTIONS.STDOUT_AS_JSON ? jsonLayout : undefined
    })
    .set("file", {
      type: "file",
      // pattern not working so we added DateFormat ourselves
      filename: `${LOG_PATH}/memebox_tsed.${TODAY_LOG_SUFFIX}.log`,
      // pattern: '.yyyy-MM-dd',
      layout: {
        type: "json",
        separator: ","
      }
    })
    .set("ERROR_FILE", {
      type: "file",
      levels: ["fatal", "error"],
      filename: `${LOG_PATH}/errors.log`,
      layout: {
        type: "json",
        separator: ","
      }
    });
}
