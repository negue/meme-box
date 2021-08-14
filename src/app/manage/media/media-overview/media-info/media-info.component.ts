import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Clip, Screen, Tag, Twitch} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../../../projects/app-state/src/lib/state/app.queries";
import {DialogService} from "../../../../shared/dialogs/dialog.service";

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

  public twitchEvents$: Observable<Twitch[]> = this.appQueries.twitchEvents$.pipe(
    map(twitchEvents => twitchEvents.filter(twitchEvent => twitchEvent.clipId == this.info.id))
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
  public onEditScreenClipOptions = new EventEmitter<Screen>();

  @Output()
  public onToggleMobileShow = new EventEmitter();

  @Output()
  public onToggleTwitchEvent = new EventEmitter<string>();

  constructor(public domSanitizer: DomSanitizer,
              private appQueries: AppQueries,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
  }

  onlyWithOneEventPossible() {
    this.dialogService.showConfirmationDialog({
      title: 'Only Clips with one Twitch Event can be toggled',
      overrideButtons: true,
      noButton: 'OK'
    });
  }
}
