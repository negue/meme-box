import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Clip, ScreenViewEntry} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";

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
  public onDeleteAssignment = new EventEmitter<string>(); // ClipID

  constructor(private appQueries: AppQueries) { }

  ngOnInit(): void {
  }

}
