import {Component, Inject, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Action, ActionType, ClipAssigningMode, Dictionary, Screen, UnassignedFilterEnum} from "@memebox/contracts";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {map, takeUntil, withLatestFrom} from "rxjs/operators";
import {FilterTypes, IFilterItem} from "../../components/filter/filter.component";
import {createCombinedFilterItems$, filterClips$} from "../../components/filter/filter.methods";
import {AppQueries, AppService} from "@memebox/app-state";


export interface ActionAssigningDialogOptions {
  mode: ClipAssigningMode;
  // Multiple, current screen
  screenId?: string;
  // Single, current selected item
  selectedItemId?: string;

  dialogTitle: string;

  showMetaItems: boolean;

  showOnlyUnassignedFilter?: boolean;
  unassignedFilterType?: UnassignedFilterEnum;
}

function unassignedFilterToString(  unassignedFilterType: UnassignedFilterEnum) {
  switch (unassignedFilterType) {
    case UnassignedFilterEnum.Timers: return 'timers';
    case UnassignedFilterEnum.Twitch: return 'twitch';
    case UnassignedFilterEnum.Screens: return 'screens';
  }

  return '';
}

const ignoreMediaTypes = [ActionType.WidgetTemplate, ActionType.PermanentScript];

@Component({
  selector: 'app-action-assigning-dialog',
  templateUrl: './action-assigning-dialog.component.html',
  styleUrls: ['./action-assigning-dialog.component.scss']
})
export class ActionAssigningDialogComponent implements OnInit, OnDestroy {
  ActionType = ActionType;

  // Media - is assigned to - Screen
  //                        - Triggers (Twitch, Timers)
  //                        -

  public filterItems$: Observable<IFilterItem[]> = createCombinedFilterItems$(
    this.appQueries.state$,
    true
  ).pipe(
    map(filterItems => {
      return filterItems.filter(item => {
        if (item.type === FilterTypes.Tags) {
          return true;
        }


        if (!this.data.showMetaItems) {
          ignoreMediaTypes.push(ActionType.Meta);
        }

        return !ignoreMediaTypes.includes(item.value);
      })
    }),
    map(filterItems => {
      if (this.data.showOnlyUnassignedFilter) {

        return [...filterItems, {
          type: FilterTypes.Misc,
          value: 'onlyUnassigned',
          label: `not assigned to ${unassignedFilterToString(this.data.unassignedFilterType)}`,
          icon: ''
        }];
      } else {
        return filterItems;
      }
    })
  );

  checkedMap: Dictionary<boolean>;

  public searchText$ = new BehaviorSubject('');
  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public actions$: Observable<Action[]> = filterClips$(
    this.appQueries.state$,
    this.filteredItems$,
    this.searchText$
  ).pipe(
    map(value => {
      if (this.data.showMetaItems) {
        return value;
      } else {
        return value.filter(c => c.type !== ActionType.Meta)
      }
    }),
    withLatestFrom(this.appQueries.state$, this.filteredItems$),
    map(([items, state, filterItems]) => {
      if (this.data.showOnlyUnassignedFilter && filterItems.some(f => f.value === 'onlyUnassigned')) {
        let isClipAssigned: (str: string) => boolean = null;

        // filter by unassigned
        switch(this.data.unassignedFilterType) {
          case UnassignedFilterEnum.Screens: {
            isClipAssigned = str =>  {
              return Object.values(state.screen).some(s => !!s.clips[str]);
            };

            break;
          }
          case UnassignedFilterEnum.Twitch: {


            isClipAssigned = str =>  {
              return Object.values(state.twitchEvents).some(t => t.clipId === str);
            };
            break;
          }
          case UnassignedFilterEnum.Timers: {
            isClipAssigned = str =>  {
              return Object.values(state.timers).some(t => t.clipId === str);
            };
            break;
          }
        }


        return items.filter(item => {
          const alreadyAssigned = isClipAssigned(item.id);

          return !alreadyAssigned;
        });
      }
       else {
         return items;
      }
    })
  );

  screen$: Observable<Screen> = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.data.screenId])
  );

  trackByAction: TrackByFunction<Action> = (index, item) => item.id;

  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ActionAssigningDialogOptions,
              public dialogRef: MatDialogRef<ActionAssigningDialogComponent>,
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

  clickToSelect(clip: Action) {
    if (this.data.mode === ClipAssigningMode.Multiple) {

      const isSelected = this.checkedMap[clip.id] || false;


      if (!isSelected) {
        this.appService.addOrUpdateScreenClip(this.data.screenId, {
          id: clip.id,
        });
      } else {
        this.appService.deleteScreenClip(this.data.screenId, clip.id);
      }
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
