import { ChangeDetectorRef, Component, EventEmitter, Input, Output, TrackByFunction } from '@angular/core';
import { Clip, CombinedClip, PositionEnum, Screen } from '@memebox/contracts';
import { DragResizeMediaComponent } from '../drag-resize-media/drag-resize-media.component';
import { AppService } from '../../../../state/app.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-screen-arrange-preview',
  templateUrl: './screen-arrange-preview.component.html',
  styleUrls: ['./screen-arrange-preview.component.scss']
})
export class ScreenArrangePreviewComponent {
  @Input()
  currentSelectedClip: CombinedClip | null = null;

  @Input()
  visibleItems: CombinedClip[];

  @Input()
  screen: Screen;

  @Output()
  changeCurrSelectedClip = new EventEmitter<CombinedClip | null>();

  PositionEnum = PositionEnum;

  trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

  private combinedClipToComponent = new WeakMap<CombinedClip, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent | null = null;

  constructor(private _cd: ChangeDetectorRef,
              private appService: AppService) {
  }


  triggerChangedetection() {
    const component = this.combinedClipToComponent.get(this.currentSelectedClip);

    console.info('trigger cd', {
      component, clip: this.currentSelectedClip
    });

    if (component) {
      component.settings = this.currentSelectedClip.clipSetting;
      component.ngOnChanges({});
    }

    this._cd.detectChanges();
  }

  elementCreated(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedClip) {
    this.combinedClipToComponent.set(pair, dragResizeMediaComponent);
  }

  async saveAllSettings() {
    for (const item of this.visibleItems) {
      // TODO replace with a bulk update
      await this.appService.addOrUpdateScreenClip(this.screen.id, item.clipSetting);
    }
  }

  onCheckedToggle($event: MatCheckboxChange, warpingCheckbox: MatCheckbox) {
    if ($event.checked) {
      warpingCheckbox.checked = false;
    }
  }

  clickedOutside() {
    this.changeCurrSelectedClip.emit(null);
    this.resetTheResizeBorder();

    console.info('clicked outside');

    this._cd.markForCheck();
  }

  reset() {
    const { clipSetting } = this.currentSelectedClip;

    clipSetting.transform = null;
    clipSetting.width = '50%';
    clipSetting.height = '50%';

    if (clipSetting.position === PositionEnum.Absolute) {
      clipSetting.top = '10%';
      clipSetting.left = '10%';
      clipSetting.right = null;
      clipSetting.bottom = null;
    }

    if (clipSetting.position === PositionEnum.Centered) {
      clipSetting.top = null;
      clipSetting.left = null;
    }

    this.appService.addOrUpdateScreenClip(this.screen.id, clipSetting);
  }

  elementClicked(dragResizeMediaComponent: DragResizeMediaComponent,
                 pair: CombinedClip) {
    this.resetTheResizeBorder();

    this.changeCurrSelectedClip.emit(pair);

    // todo select the item in the left list
    this.previouslyClickedComponent = dragResizeMediaComponent;
    dragResizeMediaComponent.showResizeBorder = true;

    console.warn('show resize border true');

    this._cd.markForCheck();
  }

  private resetTheResizeBorder() {
    if (this.previouslyClickedComponent != null) {
      this.previouslyClickedComponent.showResizeBorder = false;
    }
  }
}
