import {Component, Input} from '@angular/core';
import {CombinedClip, Screen} from '@memebox/contracts';
import {WebsocketService} from '../../../../../../../projects/app-state/src/lib/services/websocket.service';

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

  onPreview(visibleItem: CombinedClip) {
    this.wsService.onTriggerClip$.next({
      id: visibleItem.clip.id,
      targetScreen: this.screen.id
    });
  }
}
