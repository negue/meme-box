import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipAssigningMode, CombinedClip, Screen, UnassignedFilterEnum } from '@memebox/contracts';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../dialog.service';
import { AppService } from '../../../../state/app.service';

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

  @Input()
  hasUnsavedChanges: boolean;

  @Output()
  changeCurrSelectedClip = new EventEmitter<CombinedClip | null>();

  @Output()
  changesSaved = new EventEmitter();

  constructor(private dialogs: DialogService,
              private appService: AppService) {
  }

  assignMedia() {
    this.showAssignmentDialog(this.screen);
  }

  onSelectMedia(mouseEvent: MouseEvent, $event: CombinedClip) {
    this.changeCurrSelectedClip.emit($event);
    this.currentSelectedClip = $event;
  }

  preventEvent(event: Event): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
  }

  openMediaSettingsDialog($event: MouseEvent, visibleItem: CombinedClip) {
    this.preventEvent($event);

    this.currentSelectedClip = null;

    this.dialogs.showScreenClipOptionsDialog({
      clipId: visibleItem.clip.id,
      screenId: this.screen.id,
      name: visibleItem.clip.name
    });
  }

  async saveAllSettings() {
    for (const item of this.visibleItems) {
      // TODO replace with a bulk update
      await this.appService.addOrUpdateScreenClip(this.screen.id, item.clipSetting);
    }
    this.changesSaved.emit();
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
