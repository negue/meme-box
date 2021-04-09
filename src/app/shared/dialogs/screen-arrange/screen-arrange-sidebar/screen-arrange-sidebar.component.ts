import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipAssigningMode, CombinedClip, Screen, UnassignedFilterEnum } from '@memebox/contracts';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../dialog.service';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'app-screen-arrange-sidebar',
  templateUrl: './screen-arrange-sidebar.component.html',
  styleUrls: ['./screen-arrange-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenArrangeSidebarComponent {
  @Input()
  allItems: CombinedClip[];

  @Input()
  visibleItems: CombinedClip[];

  @Input()
  selectedItems: FormControl;

  @Input()
  screen: Screen;

  @Input()
  currentSelectedClip: CombinedClip | null = null;

  @Output()
  changeCurrSelectedClip = new EventEmitter<CombinedClip | null>();

  constructor(private dialogs: DialogService) {
  }

  assignMedia() {
    this.showAssignmentDialog(this.screen);
  }

  onSelectMedia(mouseEvent: MouseEvent, matRippleInstance: MatRipple, $event: CombinedClip) {
    this.changeCurrSelectedClip.emit($event);
    this.currentSelectedClip = $event;

    matRippleInstance.launch(mouseEvent.x, mouseEvent.y);
  }

  openMediaSettingsDialog($event: MouseEvent, visibleItem: CombinedClip) {
    $event.stopImmediatePropagation();
    $event.stopPropagation();

    this.currentSelectedClip = null;

    this.dialogs.showScreenClipOptionsDialog({
      clipId: visibleItem.clip.id,
      screenId: this.screen.id,
      name: visibleItem.clip.name
    });
  }

  private showAssignmentDialog(screen: Partial<Screen>) {
    this.dialogs.showClipSelectionDialog({
      mode: ClipAssigningMode.Multiple,
      screenId: screen.id,

      dialogTitle: screen.name,
      showMetaItems: false,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Screens
    });
  }
}
