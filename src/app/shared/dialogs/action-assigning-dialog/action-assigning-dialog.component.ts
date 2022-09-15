import {Component, Inject, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Action, ActionAssigningMode, ActionType, Dictionary, UnassignedFilterEnum} from "@memebox/contracts";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {map, withLatestFrom} from "rxjs/operators";
import {FilterTypes, IFilterItem} from "../../components/filter/filter.component";
import {createCombinedFilterItems$, filterClips$} from "../../components/filter/filter.methods";
import {AppQueries} from "@memebox/app-state";


export interface ActionAssigningDialogOptions {
  mode: ActionAssigningMode;

  // Single, current selected item
  selectedActionIdList: string[];

  dialogTitle: string;

  showMetaItems: boolean;  // TODO CHECK META

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

        // TODO CHECK META
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

  trackByAction: TrackByFunction<Action> = (index, item) => item.id;

  private destroy$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ActionAssigningDialogOptions,
              public dialogRef: MatDialogRef<ActionAssigningDialogComponent>,
              private appQueries: AppQueries) {
  }

  ngOnInit(): void {

    this.checkedMap = {};

    this.data.selectedActionIdList = this.data.selectedActionIdList.filter(id => !!id);

    for (const actionId of this.data.selectedActionIdList) {
      this.checkedMap[actionId] = true;
    }
  }

  clickToSelect(clip: Action): void  {
    if (this.data.mode === ActionAssigningMode.Single) {
      this.checkedMap = {
        [clip.id]: true
      };

      this.dialogRef.close(clip.id);
      return;
    }

    this.checkedMap[clip.id] = !this.checkedMap[clip.id];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
