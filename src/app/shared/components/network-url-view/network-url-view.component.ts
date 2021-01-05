import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {map, tap} from "rxjs/operators";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NetworkInterfacesService} from "../../../core/services/network-interfaces.service";
import {NetworkInfo} from "@memebox/contracts";

@Component({
  selector: 'app-network-url-view',
  templateUrl: './network-url-view.component.html',
  styleUrls: ['./network-url-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkUrlViewComponent implements OnInit {
  @Input()
  public urlPath = '';

  public selectedItem: NetworkInfo|null = null;

  public networkUrl$ = this.networkInterfaceService.networkInterface$.pipe(
    map(networkInterfaces => networkInterfaces.map(netInterface => {
      return {
        ...netInterface,
        address: `${netInterface.address}/#/${this.urlPath}`
      }
    })),
    tap(items => {
      this.selectedItem = items[0];
      this.cd.markForCheck();
    })
  )

  constructor(
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    public networkInterfaceService: NetworkInterfacesService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
  }

  copyURL(urlToOpen: string): void {
    if (this.clipboard.copy(urlToOpen)) {
      this._snackBar.open('URL copied to clipboard', null, {
        duration: 5000,
        verticalPosition: 'top'

      });
    } else {
      this._snackBar.open('URL couldn\'t be copied to clipboard', null, {
        duration: 10000,
        verticalPosition: 'top',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }

  openUrl(value: string) {
    // TODO fix open new window in electron
    window.open(value, '_blank');
  }
}
