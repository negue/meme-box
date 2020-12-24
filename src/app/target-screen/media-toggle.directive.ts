import {Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ANIMATION_IN_ARRAY, ANIMATION_OUT_ARRAY, MediaType, PositionEnum, VisibilityEnum} from "@memebox/contracts";
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

const ALL_MEDIA = [MediaType.Audio, MediaType.Video];

@Directive({
  selector: '[appMediaToggle]',
  exportAs: 'appMediaToggle'
})
export class MediaToggleDirective implements OnChanges, OnInit, OnDestroy {
  @Input()
  public combinedClip: CombinedClip;

  public isVisible$ = new BehaviorSubject<boolean>(false);

  private currentState = MediaState.HIDDEN;
  private selectedInAnimation = '';
  private selectedOutAnimation = '';
  private _destroy$ = new Subject();
  private clipVisibility: VisibilityEnum;

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent) {
  }

  @HostListener('animationend', ['$event'])
  onAnimationEnd(event: any) {
    console.info('animationend', event);
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
    if (combinedClip) {
      this.updateNeededVariables();
    }
  }



  stopIfStillPlaying(entry: KeyValue<string, CombinedClip>) {
    console.info('stopifPlaying', {
      animationOut: this.selectedOutAnimation,
      state: this.currentState,
      clipVisibility: this.clipVisibility
    });


    if (this.currentState === MediaState.VISIBLE
      && this.clipVisibility === VisibilityEnum.Play) {

     this.animateOutOrHide();
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

        if (this.clipVisibility === VisibilityEnum.Toggle && this.currentState === MediaState.VISIBLE) {
          this.animateOutOrHide();
        } else {
          this.applyPositions();

          // Trigger Play
          this.triggerState(
            this.combinedClip.clipSetting.animationIn
              ? MediaState.ANIMATE_IN
              : MediaState.VISIBLE
          );
        }
      }
    });

    this.updateNeededVariables();
  }

  private applyPositions() {
    const clipSettings = this.combinedClip.clipSetting;
    const currentPosition = clipSettings.position;

    console.info({
      clipSettings: this.combinedClip.clipSetting
    });
    if (currentPosition === PositionEnum.Absolute) {
      this.element.nativeElement.style.setProperty('--clip-setting-left', clipSettings.left);
      this.element.nativeElement.style.setProperty('--clip-setting-top', clipSettings.top);
      this.element.nativeElement.style.setProperty('--clip-setting-right', clipSettings.right);
      this.element.nativeElement.style.setProperty('--clip-setting-bottom', clipSettings.bottom);

      console.info({clipSettings});
    }

    if (currentPosition === PositionEnum.Random) {
      const {height, width} = this.combinedClip.clipSetting;

      const randomPosition = () => Math.floor(Math.random()*100);

      // both types work :D
      const left = `max(0px, calc(${randomPosition()}% - ${width}))`;
      const top = `calc(max(0px, ${randomPosition()}% - ${height}))`;

      this.element.nativeElement.style.setProperty('--clip-setting-left', left);
      this.element.nativeElement.style.setProperty('--clip-setting-top', top);

      console.info({left, top, element: this.element});
    }
  }

  private animateOutOrHide() {
    const targetState = this.selectedOutAnimation
      ? MediaState.ANIMATE_OUT
      : MediaState.HIDDEN;

    this.triggerState(targetState);

    if (targetState === MediaState.ANIMATE_OUT) {
      setTimeout(() => {
        this.triggerState(MediaState.HIDDEN);
      }, 1000);
      // 1s is the default duration of animate.style animations
      // todo add ability to change those durations
    }
  }

  private updateNeededVariables() {
    const lastVisibility = this.clipVisibility;

    this.clipVisibility = this.combinedClip.clipSetting.visibility ?? VisibilityEnum.Play;

    setTimeout(() => {
      if (lastVisibility !== VisibilityEnum.Play) {
        this.isVisible$.next(false);
      }

      if (this.clipVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(this.combinedClip.clip.type)) {
          this.playMedia();
        }

        this.isVisible$.next(true);
      } else {
        if(ALL_MEDIA.includes(this.combinedClip.clip.type)) {
          this.stopMedia();
        }
      }
    }, 100);
  }

  private getAnimationValues() {
    this.selectedInAnimation = this.getAnimationName(true);
    this.selectedOutAnimation = this.getAnimationName(false);
  }

  private playMedia() {
    const control = this.parentComp.clipToControlMap.get(this.combinedClip.clip.id);

    if (control instanceof HTMLAudioElement
      || control instanceof HTMLVideoElement) {
      control.currentTime = 0;
      control.play();
    }

    if (control instanceof HTMLImageElement) {
      // reset if its a gif
      if (this.combinedClip.clip.path.includes('.gif')) {
        control.src = '';
        control.src = this.combinedClip.clip.path;
      }
    }

    if (this.combinedClip.clip.playLength) {
      setTimeout(() => {
        this.stopIfStillPlaying(null);
      }, this.combinedClip.clip.playLength)
    }
  }

  private stopMedia () {
    const control = this.parentComp.clipToControlMap.get(this.combinedClip.clip.id);

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

        this.stopMedia();

        break;
      }
      case MediaState.ANIMATE_IN:
      {
        this.startAnimation(this.selectedInAnimation, this.combinedClip.clipSetting.animationInDuration);

        this.isVisible$.next(true);

        break;
      }
      case MediaState.VISIBLE:
      {
        this.isVisible$.next(true);
        this.removeAnimation(this.selectedInAnimation);

        // "once its done"
        this.stopMedia();
        this.playMedia();

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        this.selectedOutAnimation = this.getAnimationName(false);
        console.warn('Animation OUT', this.selectedOutAnimation, this.combinedClip.clipSetting);
        this.startAnimation(this.selectedOutAnimation, this.combinedClip.clipSetting.animationOutDuration);

        this.stopMedia();
        break;
      }
    }

    this.currentState = newState;
  }

  private startAnimation(animationName: string, animationDuration: number) {
    this.element.nativeElement.classList.add('animate__animated', animationName);
    this.element.nativeElement.style.setProperty('--animate-duration', `${animationDuration ?? 777}ms`);
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
