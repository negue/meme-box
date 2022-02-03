import {NamedLogger} from "../../../named-logger";

export class LoggerApi {
  constructor(
    public scriptName: string,
    protected baseLogger: NamedLogger
  ) {
    this.scriptName = `[Script: ${scriptName}]`;
  }

  public log(...data: unknown[]): void {
    this.baseLogger.info(this.scriptName, ...data);
  }
  public error(...data: unknown[]): void {
    this.baseLogger.error(data, this.scriptName);
  }
}
