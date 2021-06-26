import {ObsConnection} from "../../../obs-connection";
import OBSWebSocket from "obs-websocket-js";

export class ObsFilterApi {
  constructor(
    private raw: OBSWebSocket,
    private sourceName: string,
    private filterName: string) {
  }

  updateEnabled(isEnabled: boolean) {
    this.raw.send('SetSourceFilterVisibility', {
      sourceName: this.sourceName,
      filterName: this.filterName,
      filterEnabled: isEnabled
    });
  }
}

export class ObsApi {
  constructor(
    private obsConnectionService: ObsConnection,
    public raw: OBSWebSocket
  ) {

  }

  public getFilter(sourceName: string, filterName: string): ObsFilterApi {
    return new ObsFilterApi(this.raw, sourceName, filterName);
  }

  public refreshBrowserSource (sourceName: string) {
    return this.raw.send('RefreshBrowserSource' as any, {
      sourceName
    });
  }
}
