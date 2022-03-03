import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ENDPOINTS, NetworkInfo} from "@memebox/contracts";
import {map, shareReplay} from "rxjs/operators";
import {Observable} from "rxjs";
import {EXPRESS_BASE} from "../state";

const CURRENT_NETWORK_INFO: NetworkInfo = {
  ifname: `Current Location (${location.protocol}//${location.host})`,
  address: `${location.protocol}//${location.host}`
}

@Injectable({
  providedIn: 'root'
})
export class NetworkInterfacesService {

  public networkInterface$: Observable<NetworkInfo[]>;


  constructor(private http: HttpClient) {
    const port = location.port;

    this.networkInterface$ = this.http.get<NetworkInfo[]>(`${EXPRESS_BASE}/${ENDPOINTS.NETWORK_LIST}`).pipe(
      map(networkInfos => {
        const networkInfoResult: NetworkInfo[] = [
          ...networkInfos.map(networkInfo => {
            const urlBase = `${networkInfo.address}:${port}`;

            return {
              ifname: `${networkInfo.ifname} (${urlBase})`,
              address: `http://${urlBase}`
            };
          })
        ];

        if (networkInfoResult.findIndex(n => n.address.includes(CURRENT_NETWORK_INFO.address)) === -1) {
          networkInfoResult.splice(0,0, CURRENT_NETWORK_INFO);
        }

        return networkInfoResult;
      }),
      shareReplay(1)
    );
  }

}
