import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Action, ScreenViewEntry} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {filter, map, tap} from "rxjs/operators";
import {AppQueries, EXPRESS_BASE, NetworkInterfacesService} from "@memebox/app-state";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {sortClips} from "@memebox/utils";

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

  public clipList$: Observable<Action[]> = combineLatest([
    this.info$,
    this.appQueries.actionList$
  ]).pipe(
    map(([screen, clipList]) => sortClips(
      clipList.filter(clip => !!screen.clips[clip.id])
    ))
  );

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onGetUrl = new EventEmitter();

  @Output()
  public onOpenArrangeDialog = new EventEmitter();

  @Output()
  public onPreview = new EventEmitter<string>()

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Action>();

  @Output()
  public onReload = new EventEmitter();

  private _info: ScreenViewEntry;

  constructor(private appQueries: AppQueries,
              private clipboard: Clipboard,
              private _snackBar: MatSnackBar,
              public networkInterfaceService: NetworkInterfacesService) {
  }

  ngOnInit(): void {
  }

}
