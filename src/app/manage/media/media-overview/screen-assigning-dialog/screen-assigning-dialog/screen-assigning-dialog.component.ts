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
  templateUrl: './screen-assigning-dialog.component.html',
  styleUrls: ['./screen-assigning-dialog.component.css']
})
export class ScreenAssigningDialogComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  checkedMap: Dictionary<boolean>;
  obsUrls$: Observable<Screen[]> = this.appQueries.screensList$;

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
      this.appService.addOrUpdateScreenClip(value, {
        id: this.data.id,
      });
    } else {
      this.appService.deleteScreenClip(value,this.data.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
