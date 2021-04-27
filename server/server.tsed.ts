import {BeforeInit, BeforeRoutesInit, Configuration, HttpServer, Inject, PlatformApplication} from "@tsed/common";
import {API_PREFIX} from "./constants";
import {ScreenController} from "./controllers/screen.controller";
import {createWebSocketServer} from "./websocket-server";
import {TwitchBootstrap} from "./providers/twitch.bootstrap";
import {Env} from "@tsed/core";
// import * as bodyParser from "body-parser";
// import * as compress from "compression";
// import * as cookieParser from "cookie-parser";
// import * as methodOverride from "method-override";

export const isProduction = process.env.NODE_ENV === Env.PROD || true;

const rootDir = __dirname;

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  mount: {
    [API_PREFIX]: [
      ScreenController
    ]
  },
  logger: {
    debug: !isProduction,
    disableRoutesSummary: isProduction,
    disableBootstrapLog: isProduction
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
    private _twitchBootstrap: TwitchBootstrap
  ) {
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
    createWebSocketServer(this.httpServer);
  }
}
