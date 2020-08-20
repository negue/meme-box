import {Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ANIMATION_IN_ARRAY, ANIMATION_OUT_ARRAY, Clip} from "@memebox/contracts";
import {CombinedClip} from "./types";
import {KeyValue} from "@angular/common";
import {BehaviorSubject, Subject} from "rxjs";
import {TargetScreenComponent} from "./target-screen.component";
import {takeUntil} from "rxjs/operators";

enum MediaState {
  HIDDEN,
  ANIMATE_IN,
  VISIBLE,
  ANIMATE_OUT
}


@Directive({
  selector: '[appMediaToggle]',
  exportAs: 'appMediaToggle'
})
export class MediaToggleDirective implements OnChanges, OnInit, OnDestroy {

  // TODO find a better way? maybe a service?
  @Input()
  public controlsMap = new WeakMap<Clip, HTMLVideoElement | HTMLAudioElement | HTMLImageElement>();

  @Input()
  public combinedClip: CombinedClip;

  public isVisible$ = new BehaviorSubject<boolean>(false);

  private currentState = MediaState.HIDDEN;
  private selectedInAnimation = '';
  private selectedOutAnimation = '';
  private _destroy$ = new Subject();

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent) {
  }

  @HostListener('animationend', ['$event'])
  onAnimationEnd(event: any) {
    if (this.currentState === MediaState.ANIMATE_IN) {
      this.currentState = MediaState.VISIBLE;
      this.applyChangesByState();

      // TODO refactor the logic here
      this.playMedia();

      return;
    }

    if (this.currentState === MediaState.ANIMATE_OUT) {
      this.currentState = MediaState.HIDDEN;
      this.applyChangesByState();
      this.isVisible$.next(false);

      return;
    }
  }

  ngOnChanges({trigger}: SimpleChanges): void {

  }


  stopIfStillPlaying(entry: KeyValue<string, CombinedClip>) {
    if (this.currentState === MediaState.VISIBLE) {
      this.currentState = MediaState.ANIMATE_OUT;

      this.applyChangesByState();

      this.stopMedia();
    }
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit(): void {
    this.parentComp.mediaClipToShow$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(toShow => {
      if (toShow === this.combinedClip.clip.id) {
        this.currentState = MediaState.ANIMATE_IN;
        this.isVisible$.next(true);


        this.applyChangesByState();
      }
    })
  }

  private playMedia() {
    const control = this.controlsMap.get(this.combinedClip.clip);

    if (control instanceof HTMLAudioElement
      || control instanceof HTMLVideoElement) {
      control.currentTime = 0;
      control.play();
      console.info('play', control.readyState);
    }

    if (this.combinedClip.clip.playLength) {
      setTimeout(() => {
        this.stopIfStillPlaying(null);
      }, this.combinedClip.clip.playLength)
    }
  }

  private stopMedia () {
    const control = this.controlsMap.get(this.combinedClip.clip);

    if (control instanceof HTMLMediaElement) {
      control.pause();
      control.currentTime = 0;
    }
  }

  // todo refactor later once its working
  private applyChangesByState() {
    switch (this.currentState) {
      case MediaState.HIDDEN:
      {
        this.removeAnimation(this.selectedOutAnimation);
        break;
      }
      case MediaState.ANIMATE_IN:
      {
        // get the animation from screenclipsettings
        // handle the "random" id
        this.selectedInAnimation = this.randomAnimation(ANIMATION_IN_ARRAY);
        this.startAnimation(this.selectedInAnimation);
        break;
      }
      case MediaState.VISIBLE:
      {
        this.removeAnimation(this.selectedInAnimation);

        // "once its done"

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        this.selectedOutAnimation = this.randomAnimation(ANIMATION_OUT_ARRAY);
        this.startAnimation(this.selectedOutAnimation);
        break;
      }
    }
  }

  private startAnimation(animationName: string) {
    this.element.nativeElement.classList.add('animate__animated', animationName);
  }
  private removeAnimation(animationName: string) {
    this.element.nativeElement.classList.remove('animate__animated');

    if (animationName) {
      this.element.nativeElement.classList.remove(animationName);
    }
  }

  private randomAnimation(animations: string[]) {
    var randomIndex = Math.floor(Math.random() * animations.length);     // returns a random integer from 0 to 9

  return animations[randomIndex];
  }

}
