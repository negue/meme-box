import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Clip, ScreenViewEntry} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {filter, map, tap} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EXPRESS_BASE} from "../../../../state/app.service";

function createLocalOrProductionUrlBase() {
  const port = location.port;
  let urlBase = EXPRESS_BASE;

  if (port === '4200') {
    urlBase = location.host;
  }

  return urlBase;
}

@Component({
  selector: 'app-screen-info',
  templateUrl: './screen-info.component.html',
  styleUrls: ['./screen-info.component.scss']
})
export class ScreenInfoComponent implements OnInit {

  @Input()
  public screenId: string;

  @Input()
  public info$: Observable<ScreenViewEntry> = this.appQueries.screenMap$.pipe(
    filter(screenMap => !!screenMap[this.screenId]),
    map(screenMap => ({
      ...screenMap[this.screenId],
      url: `${createLocalOrProductionUrlBase()}/#/screen/${this.screenId}`
    })
  ),
    tap(screenInfo => {
      this._info = screenInfo;
    })
  );

  public clipList$: Observable<Clip[]> = combineLatest([
    this.info$,
    this.appQueries.clipList$
  ]).pipe(
    map(([screen, clipList]) => clipList.filter(clip => !!screen.clips[clip.id]))
  );

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onPreview = new EventEmitter<string>()

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onEditAssignments = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Clip>();

  @Output()
  public onReload = new EventEmitter();

  private _info: ScreenViewEntry;

  constructor(private appQueries: AppQueries,
              private clipboard: Clipboard,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  copyURL(): void {
    if (this.clipboard.copy(this._info.url)) {
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


}
