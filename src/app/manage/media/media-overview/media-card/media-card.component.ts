import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {Clip, MediaType, Screen, Tag} from "@memebox/contracts";
import {ActivityQueries} from "@memebox/app-state";

@Component({
  selector: "app-media-card",
  templateUrl: "./media-card.component.html",
  styleUrls: ["./media-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCardComponent {
  @Input()
  media: Clip;

  @Input()
  screens: Screen[];

  @Input()
  tags: Tag[];

  @Output()
  onPreview = new EventEmitter();

  @Output()
  onEdit = new EventEmitter();

  @Output()
  onDelete = new EventEmitter();

  @Output()
  onDuplicate = new EventEmitter();

  menuIsOpened = false;

  readonly MEDIA_TYPE = MediaType;

  constructor(
    public activityState: ActivityQueries
  ) {

  }


  get appearsInScreens(): Screen[] {
    const screensEmpty = this.screens == null || this.screens.length === 0;
    if (this.media == null || screensEmpty) {
      return [];
    }
    return this.screens.filter(screen => screen.clips?.[this.media.id]).filter(s => !!s);
  }

  get connectedTags(): Tag[] {
    const tagssEmpty = this.tags == null || this.tags.length === 0;
    if (this.media == null || this.media.tags == null || tagssEmpty) {
      return [];
    }
    return this.tags.filter(tag => this.media.tags.includes(tag.id));
  }
}
