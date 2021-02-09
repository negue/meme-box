import {
  AfterViewInit,
  ChangeDetectorRef,
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
import {Clip, PositionEnum, ScreenClip} from "@memebox/contracts";
import {NgxMoveableComponent} from "ngx-moveable";
import {AutoScaleComponent} from "@gewd/components/auto-scale";

@Component({
  selector: 'app-drag-resize-media',
  templateUrl: './drag-resize-media.component.html',
  styleUrls: ['./drag-resize-media.component.scss']
})
export class DragResizeMediaComponent implements OnInit, AfterViewInit ,OnChanges {

  @Input()
  public showResizeBorder = false;

  @Input()
  public clip: Clip;

  @Input()
  public settings: ScreenClip;

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

  @ViewChild('moveableInstance')
  public moveableInstance: NgxMoveableComponent;

  @ViewChild('autoScale', {static: true})
  public autoScale: AutoScaleComponent;

  frame = {
    translate: [0, 0],

    rotate: 0,
  };

  constructor(public element: ElementRef<HTMLElement>,
              private cd: ChangeDetectorRef) {

    setTimeout(() => {
      this.cd.detectChanges();
    }, 50);
  }

  ngAfterViewInit(): void {

    console.info('resize of drag-resize triggered');
   // this.autoScale.width = this.element.nativeElement.clientWidth;
   // this.autoScale.height = this.element.nativeElement.clientHeight;
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


  onDragStart({ set }) {
    set(this.frame.translate);
    console.info( this.frame);
  }
  onDrag({ target, left, top }) {
    this.element.nativeElement.style.top = `${top}px`;
    this.element.nativeElement.style.left = `${left}px`;

    this.element.nativeElement.style.right = null;
    this.element.nativeElement.style.bottom = null;

    // TODO Update on DragEnd
    this.settings.top = `${top}px`;
    this.settings.left = `${left}px`;
    this.settings.right = null;
    this.settings.bottom = null;

  }
  onDragEnd({ target, isDrag, clientX, clientY }) {
    console.log("onDragEnd", target, isDrag);
  }

  onResizeStart({ target, set, setOrigin, dragStart }) {
    // Set origin if transform-orgin use %.
    setOrigin(["%", "%"]);

    // If cssSize and offsetSize are different, set cssSize. (no box-sizing)
    const style = window.getComputedStyle(target);
    const cssWidth = parseFloat(style.width);
    const cssHeight = parseFloat(style.height);
    set([cssWidth, cssHeight]);

    // If a drag event has already occurred, there is no dragStart.
    dragStart && dragStart.set(this.frame.translate);
  }
  onResize({ target, width, height, drag }) {
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
  }
  onResizeEnd({ target, isDrag, clientX, clientY }) {
    console.log("onResizeEnd", target, isDrag);

    this.settings.width = target.style.width;
    this.settings.height = target.style.height;
  }

  onRotateStart({ set }) {
    set(this.frame.rotate);
  }
  onRotate({ target, beforeRotate }) {
    this.frame.rotate = beforeRotate;
    target.style.transform = `rotate(${beforeRotate}deg)`;
  }
  onRotateEnd({ target, isDrag, clientX, clientY }) {
    console.log("onRotateEnd", target, isDrag);
  }

  warpMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
  onWarpStart({ set }) {
    set(this.warpMatrix);
  }
  onWarp({ target, matrix, transform }) {
    this.warpMatrix = matrix;

    // target.style.transform = transform;
    target.style.transform = `matrix3d(${matrix.join(",")})`;
  }
  onWarpEnd({ target, isDrag, clientX, clientY }) {
    console.log("onWarpEnd", target, isDrag);
  }

  previewClicked($event: MouseEvent) {
    $event.stopPropagation();

    this.elementClicked.emit();
  }

  private applyPositionBySetting () {
    if (this.settings.position === PositionEnum.Absolute) {

      this.element.nativeElement.style.top = this.settings.top;
      this.element.nativeElement.style.left = this.settings.left;
      this.element.nativeElement.style.right = this.settings.right;
      this.element.nativeElement.style.bottom = this.settings.bottom;


      this.element.nativeElement.style.width = this.settings.width;
      this.element.nativeElement.style.height = this.settings.height;
    }


    console.info('Update Rect');
    this.moveableInstance?.updateRect();
  }
}
