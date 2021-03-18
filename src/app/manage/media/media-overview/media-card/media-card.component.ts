import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Clip, MediaType } from '@memebox/contracts';

@Component({
  selector: 'app-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCardComponent {
  @Input()
  media: Clip;

  @Output()
  onPreview = new EventEmitter();

  @Output()
  onEdit = new EventEmitter();

  @Output()
  onDelete = new EventEmitter();

  readonly MEDIA_TYPE = MediaType;
}
