import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Action, PositionEnum, Screen, ScreenClip } from '@memebox/contracts';
import { NgxMoveableComponent } from 'ngx-moveable';
import { parseTransformValues } from "@memebox/utils";

export interface TranslatedPosition {
  x: string;
  y: string;
}

export interface TranslatedSize {
  width: number;
  height: number;
}

@Component({
  selector: 'app-drag-resize-media',
  templateUrl: './drag-resize-media.component.html',
  styleUrls: ['./drag-resize-media.component.scss']
})
export class DragResizeMediaComponent implements OnInit, OnChanges {

  @Input()
  public showResizeBorder = false;

  @Input()
  public screen: Screen;

  @Input()
  public clip: Action;

  @Input()
  public settings: ScreenClip;

  @Input()
  public sizeType: 'px'|'%';

  @Input()
  public transformOrigin = '';

  @Input()
  public draggingEnabled: boolean;

  @Input()
  public resizeEnabled: boolean;

  @Input()
  public rotateEnabled: boolean;

  @Input()
  public warpEnabled: boolean;

  @Output()
  public elementClicked = new EventEmitter();

  @Output()
  public elementCreated = new EventEmitter();


  @Output()
  public inputApplied = new EventEmitter();

  @Output()
  public elementChanged = new EventEmitter();

  @ViewChild('moveableInstance')
  public moveableInstance: NgxMoveableComponent;

  frame: {
    translate: [number, number],
    currentDraggingPosition: TranslatedPosition | null,
    currentResizingValues: TranslatedSize | null,
    rotate: number
  } = {
    currentDraggingPosition: {
      x: null,
      y: null
    },
    currentResizingValues: {
      width: null,
      height: null
    },
    translate: [0,0],
    rotate: 0,
  };

  private warpExist = false;

  constructor(public element: ElementRef<HTMLElement>) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.info('DragResize ngChanges');
    this.applyPositionBySetting();

    this.inputApplied.next();
  }

  ngOnInit(): void {
    this.elementCreated.next();

   this.applyPositionBySetting();

   this.inputApplied.next();
  }


  onDragStart({ set }): void {
    console.info(this.frame);
    this.elementChanged.emit();
    this.inputApplied.next();
  }

  onDrag({ target, left, top }): void {
    const newPosition = this.translatePixelToTarget(left, top);


    this.updateCSSVar('top', newPosition.y);
    this.updateCSSVar('left', newPosition.x);

    this.updateCSSVar('right',  null);
    this.updateCSSVar('bottom',  null);

    this.frame.currentDraggingPosition = newPosition;
    this.elementChanged.emit();
  }

  onDragEnd({ target, isDrag, clientX, clientY }): void {
    console.log("onDragEnd", target, isDrag, { clientX, clientY });
    // TODO Update on DragEnd
    this.settings.top = this.frame.currentDraggingPosition.y;
    this.settings.left = this.frame.currentDraggingPosition.x;
    this.settings.right = null;
    this.settings.bottom = null;
    this.elementChanged.emit();
  }

  onResizeStart({ target, set, setOrigin, dragStart }): void {
    // Set origin if transform-orgin use %.
    setOrigin(['%', '%']);

    // If cssSize and offsetSize are different, set cssSize. (no box-sizing)
    const style = window.getComputedStyle(target);
    const cssWidth = parseFloat(style.width);
    const cssHeight = parseFloat(style.height);
    set([cssWidth, cssHeight]);

    // If a drag event has already occurred, there is no dragStart.
    dragStart && dragStart.set(this.frame.translate);

    const preResizeTransforms = this.generateTransformString();

    // smooth resizing from left / top
    target.style.transform = `${preResizeTransforms} translate(${this.frame.translate[0]}px, ${this.frame.translate[1]}px)`;

    this.elementChanged.emit();
  }
  onResize({ target, width, height, drag }): void {
    // let it stay on pixel since resizing in % mode doesn't work well
    const newPosition = this.translatePixelToTarget(width, height, true);

    this.updateCSSVar('width', newPosition.x);
    this.updateCSSVar('height', newPosition.y);

    this.frame.currentResizingValues.width = width;
    this.frame.currentResizingValues.height = height;

   /* const beforeTranslate = drag.beforeTranslate;

    this.frame.translate = beforeTranslate;

    // smooth resizing from left / top
    target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;


    */
    this.elementChanged.emit();
  }
  onResizeEnd({ target, isDrag, clientX, clientY }): void {
    console.log("onResizeEnd", target, isDrag);

    const newPosition = this.translatePixelToTarget(
      this.frame.currentResizingValues.width,
      this.frame.currentResizingValues.height
    );

    this.settings.width = newPosition.x;
    this.settings.height = newPosition.y;
    this.elementChanged.emit();
  }

  onRotateStart({ target, set }): void {

    set(this.frame.rotate);

    console.info('onRotateStart', this.frame.rotate);
    this.elementChanged.emit();
  }
  onRotate({ target, beforeRotate }): void {
    this.frame.rotate = beforeRotate;
  //  target.style.transform = `rotate(${beforeRotate}deg)`;
    this.applyTransform(target);
    this.elementChanged.emit();
  }
  onRotateEnd({ target, isDrag, clientX, clientY }): void {
    console.log("onRotateEnd", target, isDrag);

    this.applyTransformToSettings();
    this.elementChanged.emit();
  }

  warpMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
  onWarpStart({ set }): void {
    set(this.warpMatrix);
    this.warpExist = true;
    this.elementChanged.emit();
  }
  onWarp({ target, matrix, transform }): void {
    this.warpMatrix = matrix;

    // target.style.transform = transform;
    this.applyTransform(target);
    this.elementChanged.emit();
    //target.style.transform = `matrix3d(${matrix.join(",")})`;
  }
  onWarpEnd({ target, isDrag, clientX, clientY }): void {
    console.log("onWarpEnd", target, isDrag);

    this.applyTransformToSettings();
    this.elementChanged.emit();
  }

  previewClicked($event: MouseEvent): void {
    $event.stopPropagation();

    this.elementClicked.emit();
  }

  private generateTransformString() {
    const transformOperations = [];

    if (this.frame.rotate) {
      transformOperations.push(`rotate(${this.frame.rotate}deg)`);
    }

    if (this.warpExist) {
      transformOperations.push(`matrix3d(${this.warpMatrix.join(",")})`);
    }

    return transformOperations.join(' ');
  }

  private appendTranslatePosition(transformString: string) {
    if (this.settings.position === PositionEnum.Centered) {
      return ' translate(-50%, -50%) ' + (transformString ?? '');
    }

    return transformString;
  }

  private applyTransform (target: HTMLElement) {
    target.style.transform = this.appendTranslatePosition(
      this.generateTransformString()
    );

    if (this.transformOrigin) {
      target.style.transformOrigin = this.transformOrigin;
    }

  }

  private applyTransformToSettings () {
    this.settings.transform = this.generateTransformString();
  }

  private updateCSSVar(name: string, value: string) {
    this.element.nativeElement.style[name] = value;
    this.element.nativeElement.style.setProperty(`--resize-${name}`, value);
  }


  private getCSSVar(name: string) {
    return this.element.nativeElement.style.getPropertyValue(`--resize-${name}`);
  }
  private translatePixelToTarget(x: number, y: number, forcePixel = false): TranslatedPosition {
    x = Math.floor(x);
    y = Math.floor(y);

    if (this.sizeType === 'px' || forcePixel) {
      return {
        x: `${x}px`,
        y: `${y}px`
      };
    }

    x = Math.floor(x / this.screen.width * 100);
    y = Math.floor(y / this.screen.height * 100);

    return {
      x: `${x}%`,
      y: `${y}%`
    }
  }

  private applyPositionBySetting () {
    const {nativeElement} = this.element;

    if (this.settings.position !== PositionEnum.FullScreen){
      nativeElement.style.width = this.settings.width;
      nativeElement.style.height = this.settings.height;
    }

    if (this.settings.position === PositionEnum.FullScreen){
      nativeElement.style.width = '100%';
      nativeElement.style.height = '100%';
    }

    if (this.settings.position === PositionEnum.Absolute) {
      nativeElement.style.top = this.settings.top;
      nativeElement.style.left = this.settings.left;
      nativeElement.style.right = this.settings.right;
      nativeElement.style.bottom = this.settings.bottom;
    }

    if (this.settings.position === PositionEnum.Random) {
      nativeElement.style.top = '10%';
      nativeElement.style.left = '10%';
    }

    if (this.settings.position === PositionEnum.Centered) {
      nativeElement.style.top = '50%';
      nativeElement.style.left = '50%';
    }

    // todo warp / rotation reset
    nativeElement.style.transform = this.appendTranslatePosition(this.settings.transform);
    nativeElement.style.transformOrigin = this.transformOrigin;

    const {names, values} = parseTransformValues(nativeElement.style.transform);

    const indexOfRotation = names.findIndex(name => name === 'rotate');

    if (indexOfRotation !== -1) {
      const rotationValue = +values[indexOfRotation].replace('deg', '');

      this.frame.rotate = rotationValue;
    }

    const indexOfMatrix3d = names.findIndex(name => name === 'matrix3d');

    if (indexOfMatrix3d !== -1) {
      const matrixValue = values[indexOfMatrix3d].split(',').map(num => +num);

      this.warpMatrix = matrixValue;
      this.warpExist = true;

      console.info('Should apply warpMatrix', this.warpMatrix);
    }

    try {
      if (this.moveableInstance?.isMoveableElement(nativeElement)) {
        console.info('Update Rect');
        this.moveableInstance.updateRect();
      }
    } catch {
      // moveableInstance has some inner issue that cant be checked before
    }
  }
}
