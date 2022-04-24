import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[hover-class]'
})
export class HoverClassDirective {

  constructor(public elementRef:ElementRef) { }
  @Input('hover-class') hoverClass:any;

  @HostListener('mouseenter') onMouseEnter(): void  {
    this.elementRef.nativeElement.classList.add(this.hoverClass);
  }

  @HostListener('mouseleave') onMouseLeave(): void  {
    this.elementRef.nativeElement.classList.remove(this.hoverClass);
  }

}
