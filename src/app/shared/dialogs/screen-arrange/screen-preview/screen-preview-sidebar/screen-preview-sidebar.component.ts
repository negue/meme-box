import {Component, Input} from '@angular/core';
import {uuid} from '@gewd/utils';
import {CombinedClip, Screen} from '@memebox/contracts';
import {WebsocketService} from '@memebox/app-state';

@Component({
  selector: 'app-screen-preview-sidebar',
  templateUrl: './screen-preview-sidebar.component.html',
  styleUrls: ['./screen-preview-sidebar.component.scss']
})
export class ScreenPreviewSidebarComponent {
  @Input()
  screen: Screen;

  @Input()
  allItems: CombinedClip[];

  constructor(private wsService: WebsocketService) {
  }

  onPreview(visibleItem: CombinedClip): void {
    this.wsService.onTriggerClip$.next({
      id: visibleItem.clip.id,
      uniqueId: uuid(),
      targetScreen: this.screen.id
    });
  }
}
