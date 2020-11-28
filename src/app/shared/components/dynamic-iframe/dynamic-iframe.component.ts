import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {dynamicIframe, DynamicIframeContent} from "../../../../../projects/utils/src/lib/dynamicIframe";

@Component({
  selector: 'app-dynamic-iframe',
  templateUrl: './dynamic-iframe.component.html',
  styleUrls: ['./dynamic-iframe.component.scss']
})
export class DynamicIframeComponent implements OnInit, OnChanges {

  @ViewChild('targetIframe', {static: true})
  targetIframe: ElementRef<HTMLIFrameElement>;

  @Input()
  content: DynamicIframeContent;

  constructor() { }

  ngOnInit(): void {
    if (this.content) {
      dynamicIframe(this.targetIframe.nativeElement, this.content);
    }
  }

  ngOnChanges({content}: SimpleChanges): void {
    if(content) {
      dynamicIframe(this.targetIframe.nativeElement, content.currentValue);
    }
  }

}
