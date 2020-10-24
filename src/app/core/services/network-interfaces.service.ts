import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ENDPOINTS, NetworkInfo} from "@memebox/contracts";
import {EXPRESS_BASE} from "../../state/app.service";
import {map, shareReplay} from "rxjs/operators";
import {Observable} from "rxjs";

const CURRENT_NETWORK_INFO: NetworkInfo = {
  ifname: 'current location',
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
          CURRENT_NETWORK_INFO,
          ...networkInfos.map(networkInfo => {
            let urlBase = `${networkInfo.address}:${port}`;

            return {
              ifname: networkInfo.ifname,
              address: `http://${urlBase}`
            };
          })
        ];

        return networkInfoResult;
      }),
      shareReplay(1)
    );
  }

}
