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
  private queueCounter = 0;
  private queueTrigger = new Subject();
  private _destroy$ = new Subject();
  private clipVisibility: VisibilityEnum;

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent) {
  }

  @HostListener('animationend', ['$event'])
  onAnimationEnd(event: any) {
    console.info(this.currentState, 'animationend', event);
    if (this.currentState === MediaState.ANIMATE_IN) {
      console.warn('Change to Visible');
      this.triggerState(MediaState.VISIBLE);

      return;
    }

    if (this.currentState === MediaState.ANIMATE_OUT) {
      console.warn('Change to Hidden');
      this.triggerState(MediaState.HIDDEN);

      return;
    }
  }

  ngOnChanges({combinedClip}: SimpleChanges): void {
    if (combinedClip) {
      this.updateNeededVariables();
      this.applyPositions();
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

    this.queueTrigger.pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {

      console.info('Queue Trigger - Subscribe', this.queueCounter);

      if (this.clipVisibility !== VisibilityEnum.Toggle && this.queueCounter <= 0) {
        console.info('not toggle - no queue - exiting');
        return;
      }

      this.getAnimationValues();

      console.info({
        visibility: this.clipVisibility,
        currentState: this.currentState
      });

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
    })

    // this.parentComp.mediaClipToShow$  => fill up a queue

    // trigger only if one isnt currently running
    // once done it should trigger the next one

    this.parentComp.mediaClipToShow$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(toShow => {
      if (toShow === this.combinedClip.clip.id) {
        if (this.clipVisibility === VisibilityEnum.Toggle) {
          this.queueTrigger.next();
          return;
        }

        this.queueCounter++;

        if (this.queueCounter === 1) {

          console.info('No Queue - Triggering', this.queueCounter);

          this.queueTrigger.next();
        }
      }
    });

    this.updateNeededVariables();
    this.applyPositions();
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

      console.info('Applied Positions', {clipSettings});
    }

    if (currentPosition === PositionEnum.Random) {
      console.warn('RAMDOM');
      const {height, width} = this.combinedClip.clipSetting;

      const randomPosition = () => Math.floor(Math.random()*100);

      const randomLeft = `calc(${randomPosition()}% - ${width})`;
      const randomTop = `calc(${randomPosition()}% - ${height})`;

      this.element.nativeElement.style.setProperty('--clip-setting-left', randomLeft);
      this.element.nativeElement.style.setProperty('--clip-setting-top', randomTop);

      var computedStyle = getComputedStyle(this.element.nativeElement);
      const {left, top} = computedStyle;

      console.info({randomLeft, left, randomTop,  top, element: this.element});

      if (left.includes("-")) {
        this.element.nativeElement.style.setProperty('--clip-setting-left', '0px');
      }

      if (top.includes("-")) {
        this.element.nativeElement.style.setProperty('--clip-setting-top', '0px');
      }
    }
  }

  private animateOutOrHide() {
    const targetState = this.selectedOutAnimation
      ? MediaState.ANIMATE_OUT
      : MediaState.HIDDEN;

    this.triggerState(targetState);
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
      console.info('Media Play triggered');
      control.play().then(() => {
        console.info('Media Play done');
      });
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
        console.info('HIDDEN TRIGGERED');
        if (newState === this.currentState) {
          console.warn('ALREADY HIDDEN');
          return;
        }

        this.cleanAllAnimationClasses();
        this.isVisible$.next(false);

        this.currentState = MediaState.HIDDEN;


        this.stopMedia();

        if (this.clipVisibility !== VisibilityEnum.Toggle) {
          this.queueCounter--;
          this.queueTrigger.next();
        }

        console.info('MEDIA DONE - Queue Counter', this.queueCounter);

        return;
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
    console.info('Adding Animation to Element: ', animationName);
    this.element.nativeElement.classList.add('animate__animated', animationName);
    this.element.nativeElement.style.setProperty('--animate-duration', `${animationDuration ?? 777}ms`);

    console.info('After Adding', this.element.nativeElement.classList.toString());
  }
  private removeAnimation(animationName: string) {
    this.element.nativeElement.classList.remove('animate__animated');

    if (animationName) {
      console.info('Removing Animation from Element: ', animationName);
      this.element.nativeElement.classList.remove(animationName);
      console.info('After Remove', this.element.nativeElement.classList.toString());
    }
  }

  private cleanAllAnimationClasses() {
    const currentAnimateClasses: string[] = [];

    const classes = this.element.nativeElement.classList;

    for (let i = 0; i < classes.length; i++){
      const classItem = classes.item(i);

      if (classItem.includes('animate_')) {
        currentAnimateClasses.push(classItem);
      }
    }

    classes.remove(...currentAnimateClasses);
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
