import {Component} from '@angular/core';
import {NetworkInterfacesService} from "@memebox/app-state";

@Component({
  selector: 'app-mobile-view-link',
  templateUrl: './mobile-view-link.component.html',
  styleUrls: ['./mobile-view-link.component.scss']
})
export class MobileViewLinkComponent {

  constructor(public networkInterfacesService: NetworkInterfacesService) {
  }

  openInTab(mobileViewUrl: string) {
    window.open(`${mobileViewUrl}#/mobile`, '_blank');
  }
}
