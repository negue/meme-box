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
import {CombinedActionContext, PositionEnum, Screen} from '@memebox/contracts';
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
  set currentSelectedClip(val: CombinedActionContext | null) {
    this._currentSelectedClip = val;

    // Force view update in another CD cycle
    Promise.resolve().then(() => {
      this?._gewdAutoScale.forceUpdate();
    });
  }

  get currentSelectedClip(): CombinedActionContext | null {
    return this._currentSelectedClip;
  }

  @Input()
  visibleItems: CombinedActionContext[];

  @Input()
  screen: Screen;

  @Input()
  unsavedChangesIds: string[];

  @Output()
  public readonly changeCurrSelectedClip = new EventEmitter<CombinedActionContext | null>();

  @Output()
  public readonly userChangeElement = new EventEmitter<string>();

  // Outputs the ids of the saved medias
  @Output()
  public readonly changesSaved = new EventEmitter<string | string[]>();

  @Output()
  public readonly mediaReset = new EventEmitter<string>();

  actionsExpanded = false;

  trackByClip: TrackByFunction<CombinedActionContext> = (index, item) => item.action.id;

  get isDragEnabled(): boolean {
    return !this.currentSelectedClip?.screenMediaConfig?.arrangeLock?.position;
  }

  get isDragSet(): boolean {
    return this.isDragEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Drag) : false;
  }

  get isResizeEnabled(): boolean {
    return !this.currentSelectedClip?.screenMediaConfig?.arrangeLock?.size;
  }

  get isResizeSet(): boolean {
    return this.isResizeEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Resize) : false;
  }

  get isRotateEnabled(): boolean {
    return !this.currentSelectedClip?.screenMediaConfig?.arrangeLock?.transform;
  }

  get isRotateSet(): boolean {
    return this.isRotateEnabled ? this.globalActionsForm.value.includes(GlobalArrangeOptions.Rotate) : false;
  }

  get isWarpEnabled(): boolean {
    return !this.currentSelectedClip?.screenMediaConfig?.arrangeLock?.transform;
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

  private combinedClipToComponent = new WeakMap<CombinedActionContext, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent | null = null;
  private _currentSelectedClip: CombinedActionContext | null = null;

  @ViewChild(AutoScaleComponent)
  private _gewdAutoScale: AutoScaleComponent;

  constructor(private _cd: ChangeDetectorRef,
              private _fb: FormBuilder,
              private appService: AppService) {
  }


  triggerChangedetection(): void {
    const component = this.combinedClipToComponent.get(this.currentSelectedClip);

    if (component) {
      component.settings = this.currentSelectedClip.screenMediaConfig;
      component.ngOnChanges({}); // skipcq: JS-0573
    }

    this._cd.detectChanges();
  }

  userChangedElement(): void {
    this.userChangeElement.emit(this.currentSelectedClip.action.id);
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

    const oldPosition = this.currentSelectedClip.screenMediaConfig.position;

    this.currentSelectedClip.screenMediaConfig.position = newPosition;

    if (oldPosition === PositionEnum.FullScreen) {
      if (!this.currentSelectedClip.screenMediaConfig.height || !this.currentSelectedClip.screenMediaConfig.width) {
        this.currentSelectedClip.screenMediaConfig.height = '30%';
        this.currentSelectedClip.screenMediaConfig.width = '40%';
      }
    }

    this.userChangedElement();
    this.triggerChangedetection();
  }

  elementCreated(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedActionContext): void {
    this.combinedClipToComponent.set(pair, dragResizeMediaComponent);
  }

  clickedOutside(): void {
    this.changeCurrSelectedClip.emit(null);
    this.resetTheResizeBorder();

    console.info('clicked outside');

    this._cd.markForCheck();
  }

  applySingleChanges(): void {
    this.appService.addOrUpdateScreenMedia(this.screen.id, this.currentSelectedClip.screenMediaConfig);
    this.changesSaved.emit(this.currentSelectedClip.action.id);
  }

  async applyAllchanges() {
    // only change the ones that have been changed
    const onlyChanged = this.visibleItems
      .filter(item => this.unsavedChangesIds.includes(item.action.id))
      .map(combined => combined.screenMediaConfig);

    // update in bulk

    await this.appService.addOrUpdateScreenActionInBulk(this.screen.id, onlyChanged);

    this.changesSaved.emit(this.visibleItems.map(i => i.action.id));
  }

  reset(): void {
    const { screenMediaConfig, action } = this.currentSelectedClip;

    screenMediaConfig.transform = null;
    screenMediaConfig.width = '50%';
    screenMediaConfig.height = '50%';

    if (screenMediaConfig.position === PositionEnum.Absolute) {
      screenMediaConfig.top = '10%';
      screenMediaConfig.left = '10%';
      screenMediaConfig.right = null;
      screenMediaConfig.bottom = null;
    }

    if (screenMediaConfig.position === PositionEnum.Centered) {
      screenMediaConfig.top = null;
      screenMediaConfig.left = null;
    }

    this.appService.addOrUpdateScreenMedia(this.screen.id, screenMediaConfig);
    this.mediaReset.emit(action.id);
  }

  elementClicked(dragResizeMediaComponent: DragResizeMediaComponent,
                 pair: CombinedActionContext): void {
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
