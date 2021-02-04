import {combineLatest, Observable, of} from "rxjs";
import {IFilterItem, MEDIA_FILTER_TYPE, TYPE_FILTER_ITEMS} from "./filter.component";
import {map, switchMap} from "rxjs/operators";
import {AppState, Clip, MediaType} from "@memebox/contracts";
import {sortClips} from "../../../../../projects/utils/src/lib/sort-clips";
import {lazyArray} from "../../../../../projects/utils/src/lib/lazyArray";

export function createCombinedFilterItems$ (
  state$: Observable<AppState>,
  showOnlyAvailableTypes: boolean
): Observable<IFilterItem[]> {
  return state$.pipe(
    map((state) => {
      const filterItems = [];
      const tagDictionary = state.tags;
      const screenDictionary = state.screen;

      // todo filter media types if not existing

      const allTags = new Set<string>();
      const allTypes = new Set<MediaType>();

      for (const clip of Object.values(state.clips)) {
        allTypes.add(clip.type);

        for (const tagId of (clip?.tags ?? [])) {
          allTags.add(tagId)
        }
      }

      if (showOnlyAvailableTypes) {
        filterItems.push(...TYPE_FILTER_ITEMS.filter(filterItem => allTypes.has(filterItem.value)));
      } else {
        filterItems.push(...TYPE_FILTER_ITEMS);
      }

      allTags.forEach(value => {
        const tag = tagDictionary[value];

        if (tag) {
          console.info({ value, tag, tagDictionary });

          filterItems.push({
            value,
            icon: 'tag',
            type: 'TAG',
            label: tagDictionary[value].name
          })
        }
      })

      for (const screen of Object.values(screenDictionary)) {
        if(Object.values(screen.clips).length > 0) {
          filterItems.push({
            value: screen.id,
            icon: 'screen',
            type: 'SCREEN',
            label: screenDictionary[screen.id].name
          })
        }
      }

      return filterItems;
    })
  )
}


export function filterClips$(
  state$: Observable<AppState>,
  selectedFilters$: Observable<IFilterItem[]>
): Observable<Clip[]> {
  return combineLatest([
    state$,
    selectedFilters$
  ]).pipe(
    map(([state, filteredItems]) => {
      const allClips = Object.values(state.clips);

      if (filteredItems.length === 0) {
        return allClips;
      }

      const listOfTypes: MediaType[] = filteredItems
        .filter(f => f.type === MEDIA_FILTER_TYPE)
        .map(f => f.value);

      const listOfTagIds: string[] = filteredItems
        .filter(f => f.type === 'TAG')
        .map(f => f.value);

      const listOfScreenIds: string[] = filteredItems
        .filter(f => f.type === 'SCREEN')  // TODO extract filterTag consts
        .map(f => f.value);


      return allClips.filter(clip => {
        if (listOfTypes.length !== 0) {
          const allowedByType = listOfTypes.includes(clip.type);

          if (!allowedByType) {
            return false;
          }
        }


        if (listOfScreenIds.length !== 0) {
          const allowedByScreen = listOfScreenIds.some(screenId => !!state.screen[screenId].clips[clip.id]);

          if (!allowedByScreen) {
            return false;
          }
        }


        if (listOfTagIds.length !== 0) {
          const allowedByTag = listOfTagIds.every(filterTagId => clip.tags?.includes(filterTagId) );

          if (!allowedByTag) {
            return false;
          }
        }

        return true;
      })

    }),
    map(clipsToList => sortClips(clipsToList)),
    switchMap(clips => {
      console.info({clips});

      return clips.length === 0
          ? of([])
          : of(clips).pipe(
            // lazyArray cant work with zero items...
            lazyArray(10, 3) // todo refactor / rebuild this lazyArray pipe
          );
      }
    )
  );
}
