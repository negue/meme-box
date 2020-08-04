import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Clip, Dictionary, Screen} from "@memebox/contracts";
import {Observable, Subject} from "rxjs";
import {MatSelectionListChange} from "@angular/material/list";
import {takeUntil} from "rxjs/operators";
import {AppQueries} from "../../../../../state/app.queries";
import {AppService} from "../../../../../state/app.service";

@Component({
  selector: 'app-clip-assigning-dialog',
  templateUrl: './clip-assigning-dialog.component.html',
  styleUrls: ['./clip-assigning-dialog.component.scss']
})
export class ClipAssigningDialogComponent implements OnInit, OnDestroy {

  checkedMap: Dictionary<boolean>;
  clips$: Observable<Clip[]> = this.appQueries.clipList$;
  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: Screen,
              private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
    this.clips$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(clips => {
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
      this.appService.addOrUpdateScreenClip(this.data.id, {
        id: value,
      });
    } else {
      this.appService.deleteScreenClip(this.data.id, value);
    }
  }

  toDo() {
    console.log('MAKE THIS WORK and call onSelectionChange or something like that');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
