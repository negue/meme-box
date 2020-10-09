import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Clip, Dictionary, MediaType, Screen} from "@memebox/contracts";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {AppQueries} from "../../../../../state/app.queries";
import {AppService} from "../../../../../state/app.service";
import {IFilterItem} from "../../../../../shared/components/filter/filter.component";
import {createCombinedFilterItems$, filterClips$} from "../../../../../shared/components/filter/filter.methods";

@Component({
  selector: 'app-clip-assigning-dialog',
  templateUrl: './clip-assigning-dialog.component.html',
  styleUrls: ['./clip-assigning-dialog.component.scss']
})
export class ClipAssigningDialogComponent implements OnInit, OnDestroy {
  MediaType = MediaType;

  public filterItems$: Observable<IFilterItem[]> = createCombinedFilterItems$(
    this.appQueries.clipList$,
    this.appQueries.tagMap$
  );

  checkedMap: Dictionary<boolean>;

  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public clips$: Observable<Clip[]> = filterClips$(
    this.appQueries.clipList$,
    this.filteredItems$
  );

  screen$: Observable<Screen> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data])
  );


  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: string,
              private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
    this.screen$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((screen) => {
      this.checkedMap = {};

      Object.keys(screen.clips).forEach(clipId => {
        this.checkedMap[clipId] = true;
      });
    })
  }

  clickToSelect(clip: Clip) {
    const isSelected = this.checkedMap[clip.id] || false;


    if (!isSelected) {
      this.appService.addOrUpdateScreenClip(this.data, {
        id: clip.id,
      });
    } else {
      this.appService.deleteScreenClip(this.data, clip.id);
    }

    console.info(this.checkedMap, clip, isSelected);
    // this.checkedMap[clip.id] = !isSelected;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
