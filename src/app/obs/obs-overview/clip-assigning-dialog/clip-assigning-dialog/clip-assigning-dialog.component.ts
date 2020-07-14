import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Clip, Dictionary, ObsURL} from "@memebox/contracts";
import {Observable, Subject} from "rxjs";
import {AppQueries} from "../../../../state/app.queries";
import {MatSelectionListChange} from "@angular/material/list";
import {AppService} from "../../../../state/app.service";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-clip-assigning-dialog',
  templateUrl: './clip-assigning-dialog.component.html',
  styleUrls: ['./clip-assigning-dialog.component.css']
})
export class ClipAssigningDialogComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  checkedMap: Dictionary<boolean>;
  clips$: Observable<Clip[]> = this.appQueries.clipList$;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ObsURL,
              private appQueries: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
    this.clips$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(clips =>  {
      this.checkedMap = {};
console.info({data: this.data});
      clips.forEach(c => {
        if (this.data.clips[c.id]) {
          this.checkedMap[c.id] = true;
        }
      });
    })
  }

  onSelectionChanged($event: MatSelectionListChange) {
    const {value, selected} = $event.option;

    if (selected) {
      this.appService.addOrUpdateObsClip(this.data.id, {
        id: value,
      });
    } else {
      this.appService.deleteObsClipByClipId(this.data.id, value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
