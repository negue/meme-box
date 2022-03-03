import {ObsConnection} from "../../../obs-connection";
import type OBSWebSocket from "obs-websocket-js";
import {DisposableBase} from "./disposableBase";
import {fromEventPattern} from "rxjs";
import {takeUntil} from "rxjs/operators";


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

  public isConnected () {
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
    return fromEventPattern(
      // @ts-expect-error because the .raw.on needs a specific union type
      handler => this.raw.on(type, handler),
      handler => this.raw.off(type, handler)
    ).pipe(
      takeUntil(this._destroy$)
    )
  }

  public async refreshBrowserSource (sourceName: string) {
    await this.obsConnectionService.connectIfNot();

    await this.raw.send('RefreshBrowserSource' as any, {
      sourceName
    });
  }
}
