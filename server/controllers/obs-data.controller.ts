import {Controller, Get} from "@tsed/common";
import {ENDPOINTS} from "@memebox/contracts";
import {ObsConnection} from "../providers/obs-connection";

@Controller(ENDPOINTS.OBS_DATA.PREFIX)
export class ObsDataController {

  constructor(
    private _obsConnection: ObsConnection
  ) {
  }

  @Get(ENDPOINTS.OBS_DATA.CURRENT_BROWSER_SOURCES)
  async listBrowserSources(): Promise<unknown[]> {
    await this._obsConnection.connectIfNot();

    // browser_source

    const obsWS = await this._obsConnection.getCurrentConnection();

    const sourceTypes = await obsWS.send('GetSourcesList');

    const onlyBrowserSources = sourceTypes.sources.filter( source => source.typeId === 'browser_source');

    const browserSourceSettings: {
      messageId: string;
      status: "ok";
      sourceName: string;
      sourceType: string;
      sourceSettings: {};
    }[] = [];

    for (const onlyBrowserSource of onlyBrowserSources) {
      const settingsPerBrowserSource = await obsWS.send('GetSourceSettings', {
        sourceName: onlyBrowserSource.name
      });

      browserSourceSettings.push(settingsPerBrowserSource);
    }

    return browserSourceSettings;
  }

}
