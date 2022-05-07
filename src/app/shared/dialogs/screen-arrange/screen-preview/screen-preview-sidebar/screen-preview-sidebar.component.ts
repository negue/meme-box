import {Component, Input} from '@angular/core';
import {uuid} from '@gewd/utils';
import {CombinedActionContext, Screen} from '@memebox/contracts';
import {MemeboxWebsocketService} from '@memebox/app-state';

@Component({
  selector: 'app-screen-preview-sidebar',
  templateUrl: './screen-preview-sidebar.component.html',
  styleUrls: ['./screen-preview-sidebar.component.scss']
})
export class ScreenPreviewSidebarComponent {
  @Input()
  screen: Screen;

  @Input()
  allItems: CombinedActionContext[];

  constructor(private wsService: MemeboxWebsocketService) {
  }

  onPreview(visibleItem: CombinedActionContext): void {
    this.wsService.onTriggerAction$.next({
      id: visibleItem.action.id,
      uniqueId: uuid(),
      targetScreen: this.screen.id
    });
  }
}
