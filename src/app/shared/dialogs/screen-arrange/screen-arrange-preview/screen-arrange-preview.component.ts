import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction
} from '@angular/core';
import { Clip, CombinedClip, PositionEnum, Screen } from '@memebox/contracts';
import { DragResizeMediaComponent } from '../drag-resize-media/drag-resize-media.component';
import { AppService } from '../../../../state/app.service';
import { FormBuilder, FormControl } from '@angular/forms';

enum GlobalArrangeOptions {
  Drag,
  Resize,
  Rotate,
  Warp
}

@Component({
  selector: 'app-screen-arrange-preview',
  templateUrl: './screen-arrange-preview.component.html',
  styleUrls: ['./screen-arrange-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  @Output()
  userChangeElement = new EventEmitter();

  PositionEnum = PositionEnum;

  trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

  get isDragEnabled(): boolean {
    return this.globalActionsForm.value.includes(GlobalArrangeOptions.Drag);
  }

  get isResizeEnabled(): boolean {
    return this.globalActionsForm.value.includes(GlobalArrangeOptions.Resize);
  }

  get isRotateEnabled(): boolean {
    return this.globalActionsForm.value.includes(GlobalArrangeOptions.Rotate);
  }

  get isWarpEnabled(): boolean {
    return this.globalActionsForm.value.includes(GlobalArrangeOptions.Warp);
  }

  readonly GlobalArrangeOptions = GlobalArrangeOptions;

  globalActionsForm = new FormControl([
    GlobalArrangeOptions.Drag,
    GlobalArrangeOptions.Resize,
    GlobalArrangeOptions.Rotate
  ] as GlobalArrangeOptions[]);

  private combinedClipToComponent = new WeakMap<CombinedClip, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent | null = null;

  constructor(private _cd: ChangeDetectorRef,
              private _fb: FormBuilder,
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

  userChangedElement() {
    this.userChangeElement.emit();
  }

  elementCreated(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedClip) {
    this.combinedClipToComponent.set(pair, dragResizeMediaComponent);
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
