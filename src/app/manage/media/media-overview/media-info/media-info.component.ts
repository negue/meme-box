import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Clip, Screen, Tag} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

  @Input()
  public info: Clip;

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
  public onPreview = new EventEmitter();

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onAssignObs = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Screen>();

  constructor(public domSanitizer: DomSanitizer,
              private appQueries: AppQueries) {
  }

  ngOnInit(): void {
  }
}
