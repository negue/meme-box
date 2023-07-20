import { ENDPOINTS } from "@memebox/contracts";
import open from "open";
import { NEW_CONFIG_PATH } from "../../projects/server-common/src/lib/utils/path.utils";
import { Controller, Get, Inject } from "@tsed/common";
import { Persistence, PERSISTENCE_DI } from "@memebox/server-common";

@Controller(ENDPOINTS.OPEN.PREFIX)
export class OpenController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
  }

  @Get(ENDPOINTS.OPEN.CONFIG)
  async openConfigPath() {
    await open(NEW_CONFIG_PATH);

    return {
      open: true
    };
  }

  @Get(ENDPOINTS.OPEN.FILES)
  async openFilePath() {
    const mediaFolder = this._persistence.getConfig().mediaFolder;

    await open(mediaFolder);

    return {
      open: true
    };
  }
}

