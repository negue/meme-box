import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import {CombinedClip, PositionEnum, Screen} from '@memebox/contracts';
import {DragResizeMediaComponent} from '../drag-resize-media/drag-resize-media.component';
import {AppService} from '../../../../../../projects/app-state/src/lib/state/app.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {AutoScaleComponent} from '@gewd/components/auto-scale';

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
export class ScreenArrangePreviewComponent implements OnInit, OnDestroy {
  @Input()
  set currentSelectedClip(val: CombinedClip | null) {
    this._currentSelectedClip = val;

    // Force view update in another CD cycle
    Promise.resolve().then(() => {
      this?._gewdAutoScale.forceUpdate();
    });
  }

  get currentSelectedClip(): CombinedClip | null {
    return this._currentSelectedClip;
  }

  @Input()
  visibleItems: CombinedClip[];

  @Input()
  screen: Screen;

  @Input()
  unsavedChangesIds: string[];

  @Output()
  changeCurrSelectedClip = new EventEmitter<CombinedClip | null>();

  @Output()
  userChangeElement = new EventEmitter<string>();

  // Outputs the ids of the saved medias
  @Output()
  changesSaved = new EventEmitter<string | string[]>();

  @Output()
  mediaReset = new EventEmitter<string>();

  actionsExpanded = false;

  trackByClip: TrackByFunction<CombinedClip> = (index, item) => item.clip.id;

  get isDragEnabled(): boolean {
    return !this.currentSelectedClip?.clipSetting?.arrangeLock?.position;
  }

  get isDragSet(): boolean {
    return this.isDragEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Drag) : false;
  }

  get isResizeEnabled(): boolean {
    return !this.currentSelectedClip?.clipSetting?.arrangeLock?.size;
  }

  get isResizeSet(): boolean {
    return this.isResizeEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Resize) : false;
  }

  get isRotateEnabled(): boolean {
    return !this.currentSelectedClip?.clipSetting?.arrangeLock?.transform;
  }

  get isRotateSet(): boolean {
    return this.isRotateEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Rotate) : false;
  }

  get isWarpEnabled(): boolean {
    return !this.currentSelectedClip?.clipSetting?.arrangeLock?.transform;
  }

  get isWarpSet(): boolean {
    return this.isWarpEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Warp) : false;
  }

  readonly GlobalArrangeOptions = GlobalArrangeOptions;
  readonly PositionEnum = PositionEnum;

  globalActionsForm = new FormControl([
    GlobalArrangeOptions.Drag,
    GlobalArrangeOptions.Resize,
    GlobalArrangeOptions.Rotate
  ] as GlobalArrangeOptions[]);

  sizeSelection: 'px' | '%' = 'px';

  private combinedClipToComponent = new WeakMap<CombinedClip, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent | null = null;
  private _currentSelectedClip: CombinedClip | null = null;

  @ViewChild(AutoScaleComponent)
  private _gewdAutoScale: AutoScaleComponent;

  constructor(private _cd: ChangeDetectorRef,
              private _fb: FormBuilder,
              private appService: AppService) {
  }


  triggerChangedetection(): void {
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

  userChangedElement(): void {
    this.userChangeElement.emit(this.currentSelectedClip.clip.id);
  }

  sizeOptionChanged(newValue: 'px' | '%'): void {
    // TODO: Set the option
    //this.currentSelectedClip.clipSetting = newValue;
    this.sizeSelection = newValue;
    this.userChangedElement();
    this.triggerChangedetection();
  }

  positionOptionChanged(newPosition: PositionEnum): void {
    if (this.currentSelectedClip === null) {
      return;
    }

    const oldPosition = this.currentSelectedClip.clipSetting.position;

    this.currentSelectedClip.clipSetting.position = newPosition;

    if (oldPosition === PositionEnum.FullScreen) {
      if (!this.currentSelectedClip.clipSetting.height || !this.currentSelectedClip.clipSetting.width) {
        this.currentSelectedClip.clipSetting.height = '30%';
        this.currentSelectedClip.clipSetting.width = '40%';
      }
    }

    this.userChangedElement();
    this.triggerChangedetection();
  }

  elementCreated(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedClip): void {
    this.combinedClipToComponent.set(pair, dragResizeMediaComponent);
  }

  clickedOutside(): void {
    this.changeCurrSelectedClip.emit(null);
    this.resetTheResizeBorder();

    console.info('clicked outside');

    this._cd.markForCheck();
  }

  applySingleChanges(): void {
    this.appService.addOrUpdateScreenClip(this.screen.id, this.currentSelectedClip.clipSetting);
    this.changesSaved.emit(this.currentSelectedClip.clip.id);
  }

  async applyAllchanges() {
    // only change the ones that have been changed
    const onlyChanged = this.visibleItems
      .filter(item => this.unsavedChangesIds.includes(item.clip.id))
      .map(combined => combined.clipSetting);

    // update in bulk

    await this.appService.addOrUpdateScreenActionInBulk(this.screen.id, onlyChanged);

    this.changesSaved.emit(this.visibleItems.map(i => i.clip.id));
  }

  reset(): void {
    const { clipSetting, clip } = this.currentSelectedClip;

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
    this.mediaReset.emit(clip.id);
  }

  elementClicked(dragResizeMediaComponent: DragResizeMediaComponent,
                 pair: CombinedClip): void {
    this.resetTheResizeBorder();

    this.changeCurrSelectedClip.emit(pair);

    // todo select the item in the left list
    this.previouslyClickedComponent = dragResizeMediaComponent;
    dragResizeMediaComponent.showResizeBorder = true;

    console.warn('show resize border true');

    this._cd.markForCheck();
  }

  private resetTheResizeBorder() {
    if (this.previouslyClickedComponent !== null) {
      this.previouslyClickedComponent.showResizeBorder = false;
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }
}
