import {Component, Input} from '@angular/core';
import {Action, Screen, Tag} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "@memebox/app-state";

@Component({
  selector: 'app-clip-chips-list',
  templateUrl: './clip-chips-list.component.html',
  styleUrls: ['./clip-chips-list.component.scss']
})
export class ClipChipsListComponent {

  @Input()
  public listTags = false;

  @Input()
  public clip: Action;

  public screenList$: Observable<Screen[]> = this.appQueries.screensList$.pipe(
    map(screenList => screenList.filter(screen => !!screen.clips[this.clip.id]))
  );
  public tagList$: Observable<Tag[]> = this.appQueries.tagList$.pipe(
    map(tagList => tagList.filter(tag => this.clip.tags && this.clip.tags.includes(tag.id)))
  );

  public combinedTags$ = combineLatest([
    this.screenList$,
    this.tagList$
  ]).pipe(
    map(([screenList, tagList]) => ({screenList, tagList}))
  );


  constructor(private appQueries: AppQueries) { }
}
