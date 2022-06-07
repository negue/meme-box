import { ObsConnection, onWsEvent$ } from "../../../obs-connection";
import type OBSWebSocket from "obs-websocket-js";
import { DisposableBase } from "./disposableBase";
import { takeUntil } from "rxjs/operators";
import { ObsBrowserSourceData } from "@memebox/contracts";

export class ObsFilterApi {
  constructor(
    private obs: ObsApi,
    private sourceName: string,
    private filterName: string) {
  }

  async updateEnabled(isEnabled: boolean) {
    await this.obs.connectIfNot();

    await this.obs.raw.send('SetSourceFilterVisibility', {
      sourceName: this.sourceName,
      filterName: this.filterName,
      filterEnabled: isEnabled
    });
  }
}

export class ObsApi extends DisposableBase {
  private _isConnected = false;

  constructor(
    private obsConnectionService: ObsConnection,
    public raw: OBSWebSocket
  ) {
    super();

    this.onEvent$('ConnectionOpened').subscribe(
      value => {
        this._isConnected = true
      });

    this.onEvent$('ConnectionClosed').subscribe(
      value => {
        this._isConnected = false
      });
  }

  public getFilter(sourceName: string, filterName: string): ObsFilterApi {
    return new ObsFilterApi(this, sourceName, filterName);
  }

  public isConnected (): boolean  {
    return this._isConnected;
  }

  public connectIfNot () {
    return this.obsConnectionService.connectIfNot();
  }

  public replaceBrowserSourceUrl(
    sourceName: string,
    url: string
  ){
    return this.raw.send('SetSourceSettings', {
      sourceName,
      sourceType: 'browser_source',
      sourceSettings: {
        url
      }
    });
  }

  // todo add types once OBSWebsocketJS is built completely on types
  public onEvent$(type: string) {
    return onWsEvent$(this.raw, type).pipe(
      takeUntil(this._destroy$)
    )
  }

  public async refreshBrowserSource (sourceName: string) {
    await this.obsConnectionService.connectIfNot();

    await this.raw.send('RefreshBrowserSource' as any, {
      sourceName
    });
  }

  public async listScenes() {
    await this.obsConnectionService.connectIfNot();

    const result = await this.raw.send('GetSceneList');

    return result.status === 'ok'
      ? result.scenes
      : [];
  }

  public async listSources() {
    await this.obsConnectionService.connectIfNot();

    const result = await this.raw.send('GetSourcesList');

    return result.status === 'ok'
      ? result.sources
      : [];
  }

  public async listBrowserSources() {
    const sourceTypes = await this.listSources();

    const onlyBrowserSources = sourceTypes.filter( source => source.typeId === 'browser_source');

    const browserSourceSettings: ObsBrowserSourceData[] = [];

    for (const onlyBrowserSource of onlyBrowserSources) {
      const settingsPerBrowserSource = await this.raw.send('GetSourceSettings', {
        sourceName: onlyBrowserSource.name
      });

      browserSourceSettings.push(settingsPerBrowserSource);
    }

    return browserSourceSettings;
  }

  public async listSourceFilters(sourceName: string) {
    await this.obsConnectionService.connectIfNot();

    const result = await this.raw.send('GetSourceFilters', {
      sourceName
    });

    return result.status === 'ok'
      ? result.filters
      : [];
  }

  public async switchToScene(sceneName: string): Promise<void> {
    await this.obsConnectionService.connectIfNot();

    await this.raw.send('SetCurrentScene', {
      ['scene-name']: sceneName
    });
  }
}
