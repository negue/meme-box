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
  templateUrl: './obs-assigning-dialog.component.html',
  styleUrls: ['./obs-assigning-dialog.component.css']
})
export class ObsAssigningDialogComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  checkedMap: Dictionary<boolean>;
  obsUrls$: Observable<ObsURL[]> = this.appQueries.obsUrls$;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clip,
              private appQueries: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
    this.obsUrls$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(allUrls =>  {
      this.checkedMap = {};

      allUrls.forEach(url => {
        if (url.clips[this.data.id]) {
          this.checkedMap[url.id] = true;
        }
      });
    })
  }

  onSelectionChanged($event: MatSelectionListChange) {
    const {value, selected} = $event.option;

    if (selected) {
      this.appService.addOrUpdateObsClip(value, {
        id: this.data.id,
      });
    } else {
      this.appService.deleteObsClipByClipId(value,this.data.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
