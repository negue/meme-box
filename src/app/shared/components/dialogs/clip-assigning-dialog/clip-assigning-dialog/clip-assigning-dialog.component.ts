import {Component, Inject, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, Dictionary, MediaType, Screen} from "@memebox/contracts";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {AppQueries} from "../../../../../state/app.queries";
import {AppService} from "../../../../../state/app.service";
import {IFilterItem} from "../../../../../shared/components/filter/filter.component";
import {createCombinedFilterItems$, filterClips$} from "../../../../../shared/components/filter/filter.methods";

export enum ClipAssigningMode {
  Multiple,
  Single
}

export interface ClipAssigningDialogOptions {
  mode: ClipAssigningMode;
  // Multiple, current screen
  screenId?: string;
  // Single, current selected item
  selectedItemId?: string;

  dialogTitle: string;

  showMetaItems: boolean;
}

@Component({
  selector: 'app-clip-assigning-dialog',
  templateUrl: './clip-assigning-dialog.component.html',
  styleUrls: ['./clip-assigning-dialog.component.scss']
})
export class ClipAssigningDialogComponent implements OnInit, OnDestroy {
  MediaType = MediaType;

  public filterItems$: Observable<IFilterItem[]> = createCombinedFilterItems$(
    this.appQueries.clipList$,
    this.appQueries.tagMap$,
    true
  ).pipe(
    map(value => {
      if (this.data.showMetaItems) {
        return value;
      } else {
        return value.filter(c => c.type === 'TAG' || c.value !== MediaType.Meta)
      }
    })
  );

  checkedMap: Dictionary<boolean>;

  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public clips$: Observable<Clip[]> = filterClips$(
    this.appQueries.clipList$,
    this.filteredItems$
  ).pipe(
    map(value => {
      if (this.data.showMetaItems) {
        return value;
      } else {
        return value.filter(c => c.type !== MediaType.Meta)
      }
    })
  );

  screen$: Observable<Screen> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data.screenId])
  );

  trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClipAssigningDialogOptions,
              public dialogRef: MatDialogRef<ClipAssigningDialogComponent>,
              private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
    if (this.data.mode === ClipAssigningMode.Multiple) {
      this.screen$.pipe(
        takeUntil(this.destroy$),
      ).subscribe((screen) => {
        this.checkedMap = {};

        Object.keys(screen.clips).forEach(clipId => {
          this.checkedMap[clipId] = true;
        });
      });
    } else {
      this.checkedMap = {};
      this.checkedMap[this.data.selectedItemId] = true;
    }
  }

  clickToSelect(clip: Clip) {
    if (this.data.mode === ClipAssigningMode.Multiple) {

      const isSelected = this.checkedMap[clip.id] || false;


      if (!isSelected) {
        this.appService.addOrUpdateScreenClip(this.data.screenId, {
          id: clip.id,
        });
      } else {
        this.appService.deleteScreenClip(this.data.screenId, clip.id);
      }

      console.info(this.checkedMap, clip, isSelected);
      // this.checkedMap[clip.id] = !isSelected;
    }
    else {
      this.dialogRef.close(clip.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
