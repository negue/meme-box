import {Component, OnInit} from '@angular/core';
import {ENDPOINTS, NetworkInfo} from "@memebox/contracts";
import {EXPRESS_BASE} from "../../../state/app.service";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'app-mobile-view-link',
  templateUrl: './mobile-view-link.component.html',
  styleUrls: ['./mobile-view-link.component.css']
})
export class MobileViewLinkComponent implements OnInit {

  public networkInterface$: Observable<string>;

  constructor(private http: HttpClient) {
    this.networkInterface$ = this.http.get<NetworkInfo[]>(`${EXPRESS_BASE}/${ENDPOINTS.NETWORK_LIST}`).pipe(
      map(value => {
        const port = location.port;
        let urlBase = `${value[0].address}:${port}`;

        if (port === '4200') {
          urlBase = location.host;
        }

        return `http:///${urlBase}#/mobile`;
      } )
    );
  }

  ngOnInit(): void {
  }

  openInTab(mobileViewUrl: string) {
    window.open(mobileViewUrl, '_blank');
  }
}
