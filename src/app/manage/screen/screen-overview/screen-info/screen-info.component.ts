import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Clip, ScreenViewEntry} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-screen-info',
  templateUrl: './screen-info.component.html',
  styleUrls: ['./screen-info.component.scss']
})
export class ScreenInfoComponent implements OnInit {

  @Input()
  public info: ScreenViewEntry;
  public clipList$: Observable<Clip[]> = this.appQueries.clipList$.pipe(
    map(clipList => clipList.filter(clip => !!this.info.clips[clip.id]))
  )
  @Output()
  public onEdit = new EventEmitter();

  // TODO
  @Output()
  public onPreview = new EventEmitter()

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onEditAssignments = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Clip>();

  constructor(private appQueries: AppQueries,
              private clipboard: Clipboard,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  copyURL(): void {
    if (this.clipboard.copy(this.info.url)) {
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
