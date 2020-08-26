import {Component, OnInit} from '@angular/core';
import {ENDPOINTS, NetworkInfo} from "@memebox/contracts";
import {EXPRESS_BASE} from "../../../state/app.service";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'app-mobile-view-link',
  templateUrl: './mobile-view-link.component.html',
  styleUrls: ['./mobile-view-link.component.scss']
})
export class MobileViewLinkComponent implements OnInit {

  public networkInterface$: Observable<NetworkInfo[]>;

  constructor(private http: HttpClient) {
    const port = location.port;

    this.networkInterface$ = this.http.get<NetworkInfo[]>(`${EXPRESS_BASE}/${ENDPOINTS.NETWORK_LIST}`).pipe(
      map(networkInfos => {
        return networkInfos.map(networkInfo => {
          let urlBase = `${networkInfo.address}:${port}`;

          if (port === '4200') {
            urlBase = location.host;
          }

          return {
            ifname: networkInfo.ifname,
            address: `http:///${urlBase}#/mobile`
          };
        });
      })
    );
  }

  ngOnInit(): void {
  }

  openInTab(mobileViewUrl: string) {
    window.open(mobileViewUrl, '_blank');
  }
}
