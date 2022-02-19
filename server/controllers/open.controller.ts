import {ENDPOINTS, OPEN_CONFIG_PATH, OPEN_FILES_PATH} from "@memebox/contracts";
import open from "open";
import {NEW_CONFIG_PATH} from "../path.utils";
import {Controller, Get, Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";

@Controller(ENDPOINTS.OPEN)
export class OpenController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
  }

  @Get(OPEN_CONFIG_PATH)
  async openConfigPath() {
    await open(NEW_CONFIG_PATH);

    return {
      open: true
    };
  }

  @Get(OPEN_FILES_PATH)
  async openFilePath() {
    const mediaFolder = this._persistence.getConfig().mediaFolder;

    await open(mediaFolder);

    return {
      open: true
    };
  }
}

