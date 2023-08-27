import { ENDPOINTS } from "@memebox/contracts";
import open from "open";
import { NEW_CONFIG_PATH, Persistence } from "@memebox/server-common";
import { Controller, Get } from "@tsed/common";

@Controller(ENDPOINTS.OPEN.PREFIX)
export class OpenController {

  constructor(
    private _persistence: Persistence
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

