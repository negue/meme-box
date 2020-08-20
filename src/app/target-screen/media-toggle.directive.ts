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
      this.triggerState(MediaState.VISIBLE);

      return;
    }

    if (this.currentState === MediaState.ANIMATE_OUT) {
      this.triggerState(MediaState.HIDDEN);

      return;
    }
  }

  ngOnChanges({combinedClip}: SimpleChanges): void {

  }


  stopIfStillPlaying(entry: KeyValue<string, CombinedClip>) {
    console.info('stopifPlaying', this.currentState);
    if (this.currentState === MediaState.VISIBLE) {

      console.info('stopifPlaying', this.selectedOutAnimation);
      this.triggerState(this.selectedOutAnimation
        ? MediaState.ANIMATE_OUT
        : MediaState.HIDDEN)
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
        this.getAnimationValues();

        this.triggerState(
          this.combinedClip.clipSetting.animationIn
            ? MediaState.ANIMATE_IN
            : MediaState.VISIBLE
        );
      }
    });
  }

  private getAnimationValues() {
    this.selectedInAnimation = this.getAnimationName(true);
    this.selectedOutAnimation = this.getAnimationName(false);
  }

  private playMedia() {
    const control = this.controlsMap.get(this.combinedClip.clip);

    if (control instanceof HTMLAudioElement
      || control instanceof HTMLVideoElement) {
      control.currentTime = 0;
      control.play();
    }

    console.info('playMedia', this.combinedClip.clip);

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

  private triggerState(newState: MediaState) {
    switch (newState) {
      case MediaState.HIDDEN:
      {
        this.removeAnimation(this.selectedOutAnimation);
        this.isVisible$.next(false);
        break;
      }
      case MediaState.ANIMATE_IN:
      {
        this.startAnimation(this.selectedInAnimation);

        this.isVisible$.next(true);

        break;
      }
      case MediaState.VISIBLE:
      {
        this.isVisible$.next(true);
        this.removeAnimation(this.selectedInAnimation);

        // "once its done"
        this.playMedia();

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        this.selectedOutAnimation = this.getAnimationName(false);
        console.warn('Animation OUT', this.selectedOutAnimation, this.combinedClip.clipSetting);
        this.startAnimation(this.selectedOutAnimation);

        this.stopMedia();
        break;
      }
    }

    this.currentState = newState;
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

  private getAnimationName (animateIn: boolean) {
    let selectedAnimation = animateIn
      ? this.combinedClip.clipSetting.animationIn
      : this.combinedClip.clipSetting.animationOut;

    if (selectedAnimation === 'random') {
      selectedAnimation = this.randomAnimation(animateIn ? ANIMATION_IN_ARRAY : ANIMATION_OUT_ARRAY);
    }

    return selectedAnimation;
  }

  private randomAnimation(animations: string[]) {
    var randomIndex = Math.floor(Math.random() * animations.length);     // returns a random integer from 0 to 9

  return animations[randomIndex];
  }

}
