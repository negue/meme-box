import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {map, tap} from "rxjs/operators";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NetworkInterfacesService} from "../../../../../projects/app-state/src/lib/services/network-interfaces.service";
import {NetworkInfo} from "@memebox/contracts";
import {BehaviorSubject, combineLatest} from "rxjs";
import {MatSelectChange} from "@angular/material/select";

@Component({
  selector: 'app-network-url-view',
  templateUrl: './network-url-view.component.html',
  styleUrls: ['./network-url-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkUrlViewComponent implements OnInit, OnChanges {
  private _currentPath$ = new BehaviorSubject('');

  @Input()
  public urlPath = '';

  public selectedItem: NetworkInfo | null = null;

  public networkUrl$ = combineLatest([
    this._currentPath$,
    this.networkInterfaceService.networkInterface$
  ]).pipe(
    map(([currentPath, networkInterfaces]) => networkInterfaces.map(netInterface => {
      return {
        ...netInterface,
        address: `${netInterface.address}/#/${currentPath}`
      }
    })),
    tap(items => {
      if (this.selectedItem) {
        this.selectedItem = items.find(i => i.ifname === this.selectedItem.ifname);
      } else {
        this.selectedItem = items.find(i => !i.address.includes('localhost'));
      }

      this.cd.markForCheck();
    })
  );


  constructor (
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    public networkInterfaceService: NetworkInterfacesService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit (): void {
    this._currentPath$.next(this.urlPath);
  }

  ngOnChanges ({urlPath}: SimpleChanges): void  {
    if (urlPath) {
      this._currentPath$.next(urlPath.currentValue);
    }
  }

  copyURL (urlToOpen: string): void {
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

  openUrl (value: string): void  {
    // TODO fix open new window in electron
    window.open(value, '_blank');
  }

  selectItem ($event: MatSelectChange,
              networkInterfaces: NetworkInfo[]
  ): void  {
    this.selectedItem = networkInterfaces.find(i => i.address === $event.value);
  }
}
