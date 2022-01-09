import {BeforeInit, BeforeRoutesInit, Configuration, HttpServer, Inject, PlatformApplication} from "@tsed/common";
import {API_PREFIX} from "./constants";
import {Env} from "@tsed/core";
import {LOG_PATH} from "./path.utils";
import {Logger} from "@tsed/logger";
import {BootstrapServices} from "./providers/bootstrap.services";
import * as fs from "fs";
import {CONTROLLERS} from "./controllers";
// import * as bodyParser from "body-parser";
// import * as compress from "compression";
// import * as cookieParser from "cookie-parser";
// import * as methodOverride from "method-override";

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
export class ServerTsED implements BeforeRoutesInit, BeforeInit {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  @Inject(HttpServer)
  httpServer: HttpServer;

  constructor(
    private _mainLogger: Logger,
    _services: BootstrapServices
  ) {
    const TODAY_LOG_SUFFIX = new Date().toISOString().slice(0, 10);

    _mainLogger.appenders
      .set("stdout", {
        type: "stdout",
        levels: ["info", "debug", "trace"],
        //layout: {
        // type: "json"  // todo json on production
        //}
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

      .set("stderr", {
        levels: ["fatal", "error", "warn"],
        type: "stderr",
        layout: {
          type: "json"
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
      })
    ;
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
}
