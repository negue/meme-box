import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ClipAssigningMode, CombinedActionContext, Screen, UnassignedFilterEnum} from '@memebox/contracts';
import {FormControl} from '@angular/forms';
import {DialogService} from '../../dialog.service';

@Component({
  selector: 'app-screen-arrange-sidebar',
  templateUrl: './screen-arrange-sidebar.component.html',
  styleUrls: ['./screen-arrange-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenArrangeSidebarComponent {
  @Input()
  allItems: CombinedActionContext[];

  @Input()
  visibleItems: CombinedActionContext[];

  @Input()
  selectedItems: FormControl;

  @Input()
  screen: Screen;

  @Input()
  currentSelectedClip: CombinedActionContext | null = null;

  @Input()
  unsavedChangesIds: string[];

  @Output()
  changeCurrSelectedClip = new EventEmitter<CombinedActionContext | null>();

  constructor(private dialogs: DialogService) {
  }

  assignMedia(): void {
    this.changeCurrSelectedClip.emit(null);
    this.showAssignmentDialog(this.screen);
  }

  onSelectMedia(mouseEvent: MouseEvent, $event: CombinedActionContext): void {
    this.changeCurrSelectedClip.emit($event);
    this.currentSelectedClip = $event;
  }

  preventEvent(event: Event): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
  }

  openMediaSettingsDialog($event: MouseEvent, visibleItem: CombinedActionContext): void {
    this.preventEvent($event);

    this.changeCurrSelectedClip.emit(null);

    this.dialogs.showScreenClipOptionsDialog({
      clipId: visibleItem.action.id,
      screenId: this.screen.id,
      name: visibleItem.action.name
    });
  }

  private showAssignmentDialog(screen: Partial<Screen>) {
    this.dialogs.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Multiple,
      screenId: screen.id,

      dialogTitle: screen.name,
      showMetaItems: false,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Screens
    });
  }
}
