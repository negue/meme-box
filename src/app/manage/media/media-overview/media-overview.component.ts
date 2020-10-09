import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {Clip, MediaType, Screen} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {AppQueries} from "../../../state/app.queries";
import {ScreenAssigningDialogComponent} from "./screen-assigning-dialog/screen-assigning-dialog/screen-assigning-dialog.component";
import {WebsocketService} from "../../../core/services/websocket.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {IFilterItem, MEDIA_FILTER_TYPE, TYPE_FILTER_ITEMS} from "../../../shared/components/filter/filter.component";
import {map} from "rxjs/internal/operators";

@Component({
  selector: 'app-media-overview',
  templateUrl: './media-overview.component.html',
  styleUrls: ['./media-overview.component.scss']
})
export class MediaOverviewComponent implements OnInit {

  public filteredItems$ = new BehaviorSubject<IFilterItem[]>([]);

  public mediaList$: Observable<Clip[]> = combineLatest([
    this.query.clipList$,
    this.filteredItems$
  ]).pipe(
    map(([allClips, filteredItems]) => {
      if (filteredItems.length === 0) {
        return allClips;
      }

      const listOfTypes: MediaType[] = filteredItems
        .filter(f => f.type === MEDIA_FILTER_TYPE)
        .map(f => f.value);

      const listOfTagIds: string[] = filteredItems
        .filter(f => f.type === 'TAG')
        .map(f => f.value);

      return allClips.filter(clip => {
        let allowedByType = true;
        let allowedByTag = true;

        if (listOfTypes.length !== 0) {
          allowedByType = listOfTypes.includes(clip.type);
        }


        if (listOfTagIds.length !== 0) {
          allowedByTag = listOfTagIds.every(filterTagId => clip.tags.includes(filterTagId) );
        }


        return allowedByType && allowedByTag;
      })

    })
  );

  public screenList$: Observable<Screen[]> = this.query.screensList$;

  public filterItems$: Observable<IFilterItem[]> = combineLatest([
    this.query.clipList$,
    this.query.tagMap$
  ]).pipe(
    map(([allMedia, tagDictionary]) => {
      const filterItems = [...TYPE_FILTER_ITEMS];

      // todo filter media types if not existing

      const allTags = new Set<string>();

      for (const clip of allMedia) {
        for (const tagId of clip.tags) {
          allTags.add(tagId)
        }
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


      return filterItems;
    })
  )

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private _wsService: WebsocketService) {
  }

  ngOnInit(): void {
  }

  addNewItem(): any {
    this.showDialog(null);
  }


  showDialog(clipInfo: Partial<Clip>): void {
    this._dialog.showMediaEditDialog(clipInfo);
  }

  async onDelete(clipId: string) {
    const result = await this._dialog.showConfirmationDialog({
      title: 'Are you sure you want to delete this clip?',
    });

    if (result) {
      await this.service.deleteClip(clipId);
    }
  }

  onEdit(item: Clip): void {
    this.showDialog(item);
  }

  onPreview(item: Clip): void {
    this._wsService.triggerClipOnScreen(item.id);
  }

  onAssignObs(item: Clip): void {
    this._dialog.open(
      ScreenAssigningDialogComponent, {
        data: item
      }
    )
  }

  //TODO - the name and other information should come from the state
  onClipOptions(item: Clip, screen: Screen): void {
    this._dialog.showScreenClipOptionsDialog({
      clipId: item.id,
      screenId: screen.id,
      name: item.name
    });
  }
}
