import {combineLatest, Observable} from "rxjs";
import {FilterTypes, IFilterItem, TYPE_FILTER_ITEMS} from "./filter.component";
import {debounceTime, map} from "rxjs/operators";
import {Action, ActionType, AppState} from "@memebox/contracts";
import {actionContentContainsText, hasAdditionalContentToSearch, sortActions} from "@memebox/utils";

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
      const allTypes = new Set<ActionType>();

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
  selectedFilters$: Observable<IFilterItem[]>,
  searchByText$: Observable<string>
): Observable<Action[]> {
  return combineLatest([
    state$,
    selectedFilters$,
    searchByText$.pipe(
      debounceTime(300),
      map(searchText => searchText.toLowerCase())
    )
  ]).pipe(
    map(([state, filteredItems, searchByText]) => {
      const allActions = Object.values(state.clips);

      if (!searchByText && filteredItems.length === 0) {
        return allActions;
      }

      const listOfTypes: ActionType[] = filteredItems
        .filter(f => f.type === FilterTypes.ActionTypes)
        .map(f => f.value);

      const listOfTagIds: string[] = filteredItems
        .filter(f => f.type === FilterTypes.Tags)
        .map(f => f.value);

      const listOfScreenIds: string[] = filteredItems
        .filter(f => f.type === FilterTypes.Screens)
        .map(f => f.value);


      return allActions.filter(action => {
        // todo maybe fuzzy or other search improvements
        if (searchByText) {
          const nameContainsSearchedText = action.name.toLowerCase().includes(searchByText);
          const descriptionContainsSearchedText = action.description?.toLowerCase().includes(searchByText) ?? false;

          const contentContainSearchedText = hasAdditionalContentToSearch(action.type)
            ? actionContentContainsText(action, searchByText)
            : false;

          if (!nameContainsSearchedText && !descriptionContainsSearchedText && !contentContainSearchedText)
          {
            return false;
          }
        }


        if (listOfTypes.length !== 0) {
          const allowedByType = listOfTypes.includes(action.type);

          if (!allowedByType) {
            return false;
          }
        }


        if (listOfScreenIds.length !== 0) {
          const allowedByScreen = listOfScreenIds.some(screenId => !!state.screen[screenId].clips[action.id]);

          if (!allowedByScreen) {
            return false;
          }
        }


        if (listOfTagIds.length !== 0) {
          const allowedByTag = listOfTagIds.every(filterTagId => action.tags?.includes(filterTagId) );

          if (!allowedByTag) {
            return false;
          }
        }

        return true;
      })

    }),
    map(clipsToList => sortActions(clipsToList))
  );
}
