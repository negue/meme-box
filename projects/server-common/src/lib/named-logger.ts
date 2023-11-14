import { Opts } from "@tsed/common";
import { Logger } from "@tsed/logger";
import { Injectable } from "@tsed/di";
import { LOG_PATH } from "./utils/path.utils";
import { BehaviorSubject } from "rxjs";
import { CLI_OPTIONS } from "./utils/cli-options";
import { ErrorWithContext } from "@memebox/contracts";

// TODO add all other methods

// skipcq: JS-0579
@Injectable()
export class NamedLogger {
  public static NewestError$ = new BehaviorSubject<ErrorWithContext | null>(null);


  private logger: Logger;

  constructor(@Opts options: { name: string } = {name: 'Logger'}) {
    this.logger = new Logger(options.name);
    addDefaultLoggerAppenders(this.logger);
  }

  warn(...data: unknown[]): void {
    this.logger.warn(...data);
  }

  info(...data: unknown[]): void {
    this.logger.info(...data);
  }

  customFile(param: { date: boolean; name: string, maxLogSize?: number }): void {
    this.logger.appenders.delete('file');

    const TODAY_LOG_SUFFIX = `.${new Date().toISOString().slice(0, 10)}`;


    // todo maybe extract this and from server.tsed.ts
    this.logger.appenders.set("file", {
      type: "file",
      // pattern not working so we added DateFormat ourselves
      filename: `${LOG_PATH}/${param.name}_tsed${param.date ? TODAY_LOG_SUFFIX : ''}.log`,
      maxLogSize: param.maxLogSize,
      // pattern: '.yyyy-MM-dd',
      layout: {
        type: "json",
        separator: ""
      }
    })
  }

  error(error: Error | unknown, context?: string): void {
    if (isNormalError(error)) {
      NamedLogger.NewestError$.next({
        errorMessage: error?.message,
        errorStack: error?.stack,
        context
      });
    }

    this.logger.error(error, context ?? '');
  }

}

function isNormalError(error: any): error is Error {
  return typeof error === 'object' && error.message;
}

export function addDefaultLoggerAppenders(logger: Logger): void {
  const TODAY_LOG_SUFFIX = new Date().toISOString().slice(0, 10);

  const jsonLayout = {
    type: "json",
    separator: ""
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
      layout: jsonLayout
    })
    .set("ERROR_FILE", {
      type: "file",
      levels: ["fatal", "error"],
      filename: `${LOG_PATH}/errors.log`,
      layout: jsonLayout
    });
}
