import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";
import {HighlightService} from "@gewd/components/highlight-editor";
import {distinctUntilChanged, takeUntil} from "rxjs/operators";

@Directive({
  selector: '[highlight]'
})
export class HighlightDirective implements OnDestroy {
  private destroy$ = new Subject();
  private textToHighlight$ = new Subject<string>()

  @Input()
  public set highlight(value: string) {
    this.textToHighlight$.next(value);
  }

  @Input()
  public lang: string;

  constructor(
    private element: ElementRef<HTMLElement>,
    private highlightService: HighlightService
  ) {
    this.textToHighlight$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(async currentTextToHighlight => {
      const highlightedHtml = await this.highlightService.highlightCode(
        currentTextToHighlight, this.lang
      );

      this.element.nativeElement.innerHTML = highlightedHtml;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
