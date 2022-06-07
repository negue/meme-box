import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Action, Screen, Tag} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "@memebox/app-state";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent {

  @Input()
  public info: Action;

  public screenList$: Observable<Screen[]> = this.appQueries.screensList$.pipe(
    map(screenList => screenList.filter(screen => !!screen.clips[this.info.id]))
  );
  public tagList$: Observable<Tag[]> = this.appQueries.tagList$.pipe(
    map(tagList => tagList.filter(tag => this.info.tags && this.info.tags.includes(tag.id)))
  );

  public combinedTags$ = combineLatest([
    this.screenList$,
    this.tagList$
  ]).pipe(
    map(([screenList, tagList]) => ({screenList, tagList}))
  );

  @Output()
  public readonly onPreview = new EventEmitter();

  @Output()
  public readonly onEdit = new EventEmitter();

  @Output()
  public readonly onDelete = new EventEmitter();

  @Output()
  public readonly onEditScreenClipOptions = new EventEmitter<Screen>();

  constructor(private appQueries: AppQueries) {
  }
}
