import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { ServerTsED } from "./server.tsed";
import { ExpressServerLazy } from './server-app';


export async function bootstrapTsED() {
  try {
    const {expressServer} = await ExpressServerLazy.getValue();

    $log.debug("Start server...");
    const platform = await PlatformExpress.bootstrap(ServerTsED, {
      express: {
        app: expressServer
      },
      port: expressServer.get('port')
    });

    await platform.listen();
    $log.debug("Server initialized");

    return {
      expressServer, platform
    };
  } catch (er) {
    $log.error(er);
    throw er;
  }
}
