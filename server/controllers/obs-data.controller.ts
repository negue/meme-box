import {Controller, Get, PathParams, Post} from "@tsed/common";
import {ENDPOINTS, ObsBrowserSourceData, ObsSourceEntry, ObsSourceFilterEntry} from "@memebox/contracts";
import {ObsConnection} from "../providers/obs-connection";
import {ObsApi} from "../providers/actions/scripts/apis/obs.api";
import type {Scene} from "obs-websocket-js";

@Controller(ENDPOINTS.OBS_DATA.PREFIX)
export class ObsDataController {

  constructor(
    private _obsConnection: ObsConnection
  ) {
  }

  @Get(ENDPOINTS.OBS_DATA.CURRENT_BROWSER_SOURCES)
  async listBrowserSources(): Promise<ObsBrowserSourceData[]> {
    const obsApi = await this.getObsApi();

    return obsApi.listBrowserSources();
  }

  @Post(`${ENDPOINTS.OBS_DATA.REFRESH_BROWSER_SOURCE}/:sourceName`)
  async refreshBrowserSource(
    @PathParams("sourceName") sourceName: string,
  ): Promise<void> {
    const obsApi = await this.getObsApi();

    await obsApi.refreshBrowserSource(sourceName)
  }

  @Get(ENDPOINTS.OBS_DATA.SCENE_LIST)
  async getSceneList(): Promise<Scene[]> {
    const obsApi = await this.getObsApi();

    return obsApi.listScenes();
  }

  @Get(ENDPOINTS.OBS_DATA.SOURCE_LIST)
  async getSourceList(): Promise<ObsSourceEntry[]> {
    const obsApi = await this.getObsApi();

    return obsApi.listSources()
  }

  @Get(`${ENDPOINTS.OBS_DATA.SOURCE_FILTER_LIST}:sourceName`)
  async getSourceFilterList(
    @PathParams("sourceName") sourceName: string,
  ): Promise<ObsSourceFilterEntry[]> {
    const obsApi = await this.getObsApi();

    return obsApi.listSourceFilters(sourceName)
  }

  private obsApi: ObsApi;

  private async getObsApi(): Promise<ObsApi> {
    return this.obsApi ?? (this.obsApi = new ObsApi(
      this._obsConnection,
      await this._obsConnection.getCurrentConnection()
    ));
  }
}
