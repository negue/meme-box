import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Scene } from "obs-websocket-js";
import { ENDPOINTS, ObsSourceEntry, ObsSourceFilterEntry } from "@memebox/contracts";
import { combineLatest, from, Observable, of, Subject } from "rxjs";
import { map, startWith, switchMap, takeUntil } from "rxjs/operators";
import { MemeboxApiService } from "@memebox/app-state";
import { RecipeCommandConfigObsSetFilterStatePayload } from "@memebox/recipe-core";

@Component({
  selector: 'app-obs-filter-selection',
  templateUrl: './obs-filter-selection.component.html',
  styleUrls: ['./obs-filter-selection.component.scss']
})
export class ObsFilterSelectionComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public sourceFormControl = new FormControl();
  public filterFormControl = new FormControl();

  public selectedSourceSubject = new Subject<string>();
  public selectedFilterSubject = new Subject<string>();

  @Input()
  public payload: RecipeCommandConfigObsSetFilterStatePayload|null = null;

  @Output()
  public readonly payloadChanged: Observable<RecipeCommandConfigObsSetFilterStatePayload> = combineLatest([
    this.selectedSourceSubject,
    this.selectedFilterSubject
  ]).pipe(
    map(([sourceName, filterName]) => {
      return {
        filterName,
        sourceName
      }
    })
  );

  public allSourceListAsync = this.memeboxApi.get<ObsSourceEntry[]>(
    `${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SOURCE_LIST}`
  );

  public allSceneListAsync = this.memeboxApi.get<Scene[]>(
    `${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SCENE_LIST}`
  );


  public filteredSourceList$ = combineLatest([
    this.sourceFormControl.valueChanges.pipe(
      startWith(''),
    ),
    from(this.allSourceListAsync),
    from(this.allSceneListAsync)
  ]).pipe(
    map(([enteredText, allSources, allScenes]) => {
      const completeList = [
        ...(allSources?.map(s => s.name) ?? []),
        ...(allScenes?.map(s => s.name) ?? [])
      ];

      if (!enteredText) {
        return completeList;
      }

      enteredText = enteredText.toLowerCase();

      return completeList?.filter(s => s.toLowerCase().includes(enteredText));
    })
  );

  public allFiltersOfSource$ = this.selectedSourceSubject.pipe(
    switchMap(selectedFilter => {
      return selectedFilter
        ? this.memeboxApi.get<ObsSourceFilterEntry[]>(
          `${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SOURCE_FILTER_LIST}${encodeURIComponent(selectedFilter)}`
          )
        : of([])
    }),
  );

  public filteredFilterList$ = combineLatest([
    this.filterFormControl.valueChanges.pipe(
      startWith(''),
    ),
    this.allFiltersOfSource$
  ]).pipe(
    map(([enteredText, allFilters]) => {
      if (!enteredText) {
        return allFilters;
      }

      enteredText = enteredText.toLowerCase();

      return allFilters?.filter(s => s.name.toLowerCase().includes(enteredText));
    })
  );


  constructor(
    private memeboxApi: MemeboxApiService,
  ) {
    // Load State once

  }

  ngOnInit(): void {
    if (this.payload) {
      this.sourceFormControl.patchValue(this.payload.sourceName);
      this.filterFormControl.patchValue(this.payload.filterName);

      setTimeout(() => {
        this.selectedSourceSubject.next(this.payload.sourceName);
        this.selectedFilterSubject.next(this.payload.filterName);
      });
    }

    this.sourceFormControl.valueChanges.pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.filterFormControl.patchValue(undefined);
      this.selectedFilterSubject.next(undefined);
    })
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
