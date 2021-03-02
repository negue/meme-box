import { AfterViewInit, Directive, HostBinding } from '@angular/core';

@Directive({
  selector: 'mat-expansion-panel[appPreventAnimationOnFirstView]'
})
export class PreventAnimationOnFirstViewDirective implements AfterViewInit {

  @HostBinding('@.disabled')
  public disableAnimation = true;

  constructor() { }

  ngAfterViewInit (): void {
    setTimeout(() => { this.disableAnimation = false; });
  }

}
