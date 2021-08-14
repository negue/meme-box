import {Component, OnInit} from '@angular/core';
import {NetworkInterfacesService} from "../../../../../projects/app-state/src/lib/services/network-interfaces.service";

@Component({
  selector: 'app-mobile-view-link',
  templateUrl: './mobile-view-link.component.html',
  styleUrls: ['./mobile-view-link.component.scss']
})
export class MobileViewLinkComponent implements OnInit {

  constructor(public networkInterfacesService: NetworkInterfacesService) {
  }

  ngOnInit(): void {
  }

  openInTab(mobileViewUrl: string) {
    window.open(`${mobileViewUrl}#/mobile`, '_blank');
  }
}
