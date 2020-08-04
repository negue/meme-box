import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Clip, ScreenViewEntry} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-obs-info',
  templateUrl: './obs-info.component.html',
  styleUrls: ['./obs-info.component.scss']
})
export class ObsInfoComponent implements OnInit {

  public clipList$: Observable<Clip[]> = this.appQueries.clipList$.pipe(
    map(clipList => clipList.filter(clip => !!this.info.clips[clip.id]))
  )

  @Input()
  public info: ScreenViewEntry;

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onEditAssignments = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Clip>();

  constructor(private appQueries: AppQueries,
              private clipboard: Clipboard,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  copyURL(): void {
    if (this.clipboard.copy(this.info.url)) {
      this._snackBar.open('URL copied to clipboard', null, {
        duration: 5000,
      });
    } else {
      this._snackBar.open('URL couldn\'t be copied to clipboard', null, {
        duration: 10000,

        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }


}
