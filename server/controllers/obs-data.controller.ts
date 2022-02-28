import {Controller, Get, PathParams, Post} from "@tsed/common";
import {ENDPOINTS, ObsBrowserSourceData} from "@memebox/contracts";
import {ObsConnection} from "../providers/obs-connection";

@Controller(ENDPOINTS.OBS_DATA.PREFIX)
export class ObsDataController {

  constructor(
    private _obsConnection: ObsConnection
  ) {
  }

  @Get(ENDPOINTS.OBS_DATA.CURRENT_BROWSER_SOURCES)
  async listBrowserSources(): Promise<ObsBrowserSourceData[]> {
    await this._obsConnection.connectIfNot();

    // browser_source

    const obsWS = await this._obsConnection.getCurrentConnection();

    const sourceTypes = await obsWS.send('GetSourcesList');

    const onlyBrowserSources = sourceTypes.sources.filter( source => source.typeId === 'browser_source');

    const browserSourceSettings: ObsBrowserSourceData[] = [];

    for (const onlyBrowserSource of onlyBrowserSources) {
      const settingsPerBrowserSource = await obsWS.send('GetSourceSettings', {
        sourceName: onlyBrowserSource.name
      });

      browserSourceSettings.push(settingsPerBrowserSource);
    }

    return browserSourceSettings;
  }


  @Post(`${ENDPOINTS.OBS_DATA.REFRESH_BROWSER_SOURCE}/:sourceName`)
  async refreshBrowserSource(
    @PathParams("sourceName") sourceName: string,
  ): Promise<unknown> {
    await this._obsConnection.connectIfNot();

    const obsWS = await this._obsConnection.getCurrentConnection();

    return await obsWS.send('RefreshBrowserSource', {
      sourceName: sourceName
    });
  }
}
