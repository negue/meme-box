import {BeforeInit, BeforeRoutesInit, Configuration, HttpServer, Inject, PlatformApplication} from "@tsed/common";
import {API_PREFIX} from "./constants";
import {Env} from "@tsed/core";
import {Logger} from "@tsed/logger";
import {BootstrapServices} from "./providers/bootstrap.services";
import * as fs from "fs";
import {CONTROLLERS} from "./controllers";
import {addDefaultLoggerAppenders} from "./providers/named-logger";
import {OnReady} from "@tsed/common/lib/platform/interfaces/OnReady";
import {CLI_OPTIONS} from "./utils/cli-options";
import {ScriptHandler} from "./providers/actions/scripts/script.handler";
import {Action, ActionType} from "@memebox/contracts";
import {uuid} from "@gewd/utils";
import {applyScriptConfigToAction} from "@memebox/utils";
// import * as bodyParser from "body-parser";

export const isProduction = !fs.existsSync('package.json')
  || process.env.NODE_ENV === Env.PROD;

const rootDir = __dirname;

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  mount: {
    [API_PREFIX+'/']: CONTROLLERS
  },
  logger: {
    debug: false,
    disableRoutesSummary: isProduction,
    disableBootstrapLog: isProduction,
    logRequest: false
  }
})
export class ServerTsED implements BeforeRoutesInit, BeforeInit, OnReady {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  @Inject(HttpServer)
  httpServer: HttpServer;

  constructor(
    private _mainLogger: Logger,
    _services: BootstrapServices,
    private _scriptHandler: ScriptHandler
  ) {
    addDefaultLoggerAppenders(_mainLogger);
  }

  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {ServerTsED}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    // Add middlewares here only when all of your legacy routes are migrated to Ts.ED
    // this.app
    //   .use(cookieParser())
    //   .use(compress({}))
    //   .use(methodOverride())
    //   .use(bodyParser.json())
    //   .use(bodyParser.urlencoded({
    //     extended: true
    //   }));
  }

  $beforeInit(): void | Promise<any> {
  }

  async $onReady(): Promise<void> {
    if (CLI_OPTIONS.CI_TEST_MODE) {
      const customScriptActionToStrigger: Action = {
        name: 'My CI Script',
        id: uuid(),
        type: ActionType.Script
      };

      applyScriptConfigToAction({
        settings: {

        },
        bootstrapScript: '',
        executionScript: `
          logger.log('Scripts seem to be working');
        `
      }, customScriptActionToStrigger);

      await this._scriptHandler.handleScript(customScriptActionToStrigger, {
        id: customScriptActionToStrigger.id,
        uniqueId: uuid()
      });

      process.exit();
    }
  }
}
