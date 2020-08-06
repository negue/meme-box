import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Clip, Dictionary, MediaType, Screen} from "@memebox/contracts";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {AppQueries} from "../../../../../state/app.queries";
import {AppService} from "../../../../../state/app.service";

@Component({
  selector: 'app-clip-assigning-dialog',
  templateUrl: './clip-assigning-dialog.component.html',
  styleUrls: ['./clip-assigning-dialog.component.scss']
})
export class ClipAssigningDialogComponent implements OnInit, OnDestroy {
  MediaType = MediaType;

  checkedMap: Dictionary<boolean>;

  selectedFilters$ = new BehaviorSubject<MediaType[]>([]);
  clips$: Observable<Clip[]> = combineLatest([
    this.selectedFilters$,
    this.appQueries.clipList$
  ]).pipe(
    map(([filters, clipList]) => {
      return filters.length === 0
        ? clipList
        : clipList.filter(clip => filters.includes(clip.type))
    })
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

  toggleFilter(type: MediaType) {
    const currentFilters = [...this.selectedFilters$.getValue()];
    const currentPosition = currentFilters.indexOf(type);

    if (currentPosition !== -1) {
      currentFilters.splice(currentPosition, 1);
    } else {
      currentFilters.push(type);
    }

    this.selectedFilters$.next(currentFilters);
  }
}
