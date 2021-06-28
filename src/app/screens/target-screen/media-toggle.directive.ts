import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  ANIMATION_IN_ARRAY,
  ANIMATION_OUT_ARRAY,
  CombinedClip,
  MediaType,
  PositionEnum, ScreenClip,
  TriggerAction,
  VisibilityEnum
} from "@memebox/contracts";
import {KeyValue} from "@angular/common";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {TargetScreenComponent} from "./target-screen.component";
import { filter, mergeMap, take, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import {DynamicIframeComponent} from "../../shared/components/dynamic-iframe/dynamic-iframe.component";
import {WebsocketService} from "../../core/services/websocket.service";
import { consoleInfo } from "@gewd/utils/rxjs";

export enum MediaState {
  HIDDEN,
  ANIMATE_IN,
  VISIBLE,
  ANIMATE_OUT
}

// TODO POSSIBLE TO SPLIT UP?

const ALL_MEDIA = [MediaType.Audio, MediaType.Video];

@Directive({
  selector: '[appMediaToggle]',
  exportAs: 'appMediaToggle'
})
export class MediaToggleDirective implements OnChanges, OnInit, OnDestroy {
  @Input()
  public clipId: string;

  @Input()
  public mediaHoldingElement: HTMLElement;

  @Input()
  public screenId: string;

  @Output()
  public mediaStateChanged = new EventEmitter<MediaState>();

  public isVisible$ = new BehaviorSubject<boolean>(false);


  private clipId$ = new BehaviorSubject(null);
  private combinedClip$: Observable<CombinedClip>;


  private currentState = MediaState.HIDDEN;
  private selectedInAnimation = '';
  private selectedOutAnimation = '';
  private queueCounter = 0;
  private queueTrigger = new Subject<TriggerAction>();
  private _currentTriggeredPayload: TriggerAction;
  private _destroy$ = new Subject();
  private clipVisibility: VisibilityEnum;

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent,
              private webSocket: WebsocketService) {
  }

  @HostListener('animationend', ['$event'])
  async onAnimationEnd(event: any) {
    const combinedClip = await this.combinedClip$.pipe(
      take(1)
    ).toPromise()


    console.info(this.currentState, 'animationend', event);
    if (this.currentState === MediaState.ANIMATE_IN) {
      console.warn('Change to Visible');
      this.triggerState(combinedClip, MediaState.VISIBLE);

      return;
    }

    if (this.currentState === MediaState.ANIMATE_OUT) {
      console.warn('Change to Hidden');
      this.triggerState(combinedClip, MediaState.HIDDEN);

      return;
    }
  }

  ngOnChanges({clipId}: SimpleChanges): void {
    if (clipId) {
      this.clipId$.next(clipId);
    }
  }

  stopIfStillPlaying(combinedClip: CombinedClip) {
    console.info('stopifPlaying', {
      animationOut: this.selectedOutAnimation,
      state: this.currentState,
      clipVisibility: this.clipVisibility,
      currentState: this.currentState
    });


    if (this.currentState === MediaState.VISIBLE
      && this.clipVisibility === VisibilityEnum.Play) {
      console.info('should trigger animateOutOrHide', combinedClip);
      this.animateOutOrHide(combinedClip);
    }
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit(): void {
    this.clipId$.next(this.clipId);
    this.combinedClip$ = this.clipId$.pipe(
      filter(clipId => !!clipId),
      tap(clipId => console.info({ clipId })),
      mergeMap(clipId => this.parentComp.getClipById$(clipId)),
      tap(clipById => console.info({ clipById })),
      filter(combinedClip => !!combinedClip)
    );

    // TODO combine "combinedClip" with "queueTrigger"
    // which will have the overrides inside => "less headache"

    this.combinedClip$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(combinedClip => {
      this.updateNeededVariables(combinedClip);
      this.applyPositions(combinedClip);
    });

    this.queueTrigger.pipe(
      withLatestFrom(this.combinedClip$),
      takeUntil(this._destroy$)
    ).subscribe(([triggerEvent, combinedClip]) => {
      this._currentTriggeredPayload = triggerEvent;

      console.info('Queue Trigger - Subscribe', this.queueCounter);

      if (this.clipVisibility !== VisibilityEnum.Toggle && this.queueCounter <= 0) {
        console.info('not toggle - no queue - exiting');
        return;
      }

      this.getAnimationValues(combinedClip.clipSetting);

      console.info({
        visibility: this.clipVisibility,
        currentState: this.currentState
      });

      if (this.clipVisibility === VisibilityEnum.Toggle && this.currentState === MediaState.VISIBLE) {
        this.animateOutOrHide(combinedClip);
      } else {
        this.applyPositions(combinedClip);

        // Trigger Play
        this.triggerState(
          combinedClip,
          combinedClip.clipSetting.animationIn
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
      if (toShow?.id === this.clipId) {
        if (this.clipVisibility === VisibilityEnum.Toggle) {
          this.queueTrigger.next(toShow);
          return;
        }

        this.queueCounter++;

        if (this.queueCounter === 1) {

          console.info('No Queue - Triggering', this.queueCounter);

          this.queueTrigger.next(toShow);
        }
      }
    });
  }

  private applyPositions(combinedClip: CombinedClip) {
    const clipSettings = combinedClip.clipSetting;
    const currentPosition = clipSettings.position;

    console.info({
      clipSettings
    });
    if (currentPosition === PositionEnum.Absolute) {
      this.element.nativeElement.style.setProperty('--clip-setting-left', clipSettings.left);
      this.element.nativeElement.style.setProperty('--clip-setting-top', clipSettings.top);
      this.element.nativeElement.style.setProperty('--clip-setting-right', clipSettings.right);
      this.element.nativeElement.style.setProperty('--clip-setting-bottom', clipSettings.bottom);

      console.info('Applied Positions', combinedClip.clip.id, {clipSettings});
    }

    if (currentPosition === PositionEnum.Random) {
      console.warn('RAMDOM');
      const {height, width} = combinedClip.clipSetting;

      const randomPosition = () => Math.floor(Math.random()*100);

      const randomLeft = `calc(${randomPosition()}% - ${width})`;
      const randomTop = `calc(${randomPosition()}% - ${height})`;

      this.element.nativeElement.style.setProperty('--clip-setting-left', randomLeft);
      this.element.nativeElement.style.setProperty('--clip-setting-top', randomTop);

      const computedStyle = getComputedStyle(this.element.nativeElement);
      const {left, top} = computedStyle;

      console.info({randomLeft, left, randomTop,  top, element: this.element});

      if (left.includes("-")) {
        this.element.nativeElement.style.setProperty('--clip-setting-left', '0px');
      }

      if (top.includes("-")) {
        this.element.nativeElement.style.setProperty('--clip-setting-top', '0px');
      }
    }

    let transformToApply = '';

    if (currentPosition === PositionEnum.Centered) {
      transformToApply = 'translate(-50%, -50%) ';
    }

    if (clipSettings.transform) {
      transformToApply += clipSettings.transform;
    }

    console.info({transformToApply, clipSettings});

    this.element.nativeElement.style.setProperty('--clip-setting-transform', transformToApply);
  }

  private animateOutOrHide(combinedClip: CombinedClip) {
    const targetState = this.selectedOutAnimation
      ? MediaState.ANIMATE_OUT
      : MediaState.HIDDEN;

    this.triggerState(combinedClip, targetState);
  }

  private updateNeededVariables(combinedClip: CombinedClip) {
    const lastVisibility = this.clipVisibility;

    this.clipVisibility = combinedClip.clipSetting.visibility ?? VisibilityEnum.Play;

    setTimeout(() => {
      if (lastVisibility !== VisibilityEnum.Play) {
        this.isVisible$.next(false);
      }

      if (this.clipVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(combinedClip.clip.type)) {
          this.playMedia(combinedClip);
        }

        this.isVisible$.next(true);
      } else {
        if(ALL_MEDIA.includes(combinedClip.clip.type)) {
          this.stopMedia();
        }
      }
    }, 100);
  }

  private getAnimationValues(clipSettings: ScreenClip) {
    this.selectedInAnimation = this.getAnimationName(clipSettings, true);
    this.selectedOutAnimation = this.getAnimationName(clipSettings,false);
  }

  private playMedia(combinedClip: CombinedClip) {
    const control = this.parentComp.clipToControlMap.get(this.clipId);

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
      if (combinedClip.clip.path.includes('.gif')) {
        control.src = '';
        control.src = combinedClip.clip.path;
      }
    }

    if (combinedClip.clip.playLength) {
      setTimeout(() => {
        this.stopIfStillPlaying(combinedClip);
      }, combinedClip.clip.playLength)
    }
  }

  private stopMedia () {
    const control = this.parentComp.clipToControlMap.get(this.clipId);

    if (control instanceof HTMLMediaElement) {
      control.pause();
      control.currentTime = 0;
    }
  }

  private triggerState(combinedClip: CombinedClip, newState: MediaState) {
    this.mediaStateChanged.emit(newState);

    console.info('switching to state', newState);

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
        this.webSocket.updateMediaState(
          this.clipId,
          this.screenId,
          false
        );

        this.stopMedia();

        if (this.clipVisibility !== VisibilityEnum.Toggle) {
          this.queueCounter--;
          this.queueTrigger.next(this._currentTriggeredPayload);
        }

        console.info('MEDIA DONE - Queue Counter', this.queueCounter);

        return;
      }
      case MediaState.ANIMATE_IN:
      {
        this.startAnimation(this.selectedInAnimation, combinedClip.clipSetting.animationInDuration);

        this.isVisible$.next(true);

        break;
      }
      case MediaState.VISIBLE:
      {
        this.isVisible$.next(true);
        this.removeAnimation(this.selectedInAnimation);
        this.triggerComponentIsShown();

        // "once its done"
        this.stopMedia();
        this.playMedia(combinedClip);

        this.webSocket.updateMediaState(
          this.clipId,
          this.screenId,
          true
        );

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        this.selectedOutAnimation = this.getAnimationName(combinedClip.clipSetting, false);
        this.startAnimation(this.selectedOutAnimation, combinedClip.clipSetting.animationOutDuration);

        this.stopMedia();

        break;
      }
    }

    this.currentState = newState;
  }

  private getElementToAddAnimation() {
    // this.parentComp.clipToControlMap.get(this.combinedClip.clip.id);

    return this.mediaHoldingElement;
  }

  private startAnimation(animationName: string, animationDurationValue: number) {
    const elementToAnimate = this.getElementToAddAnimation();

    if (!elementToAnimate) {
      console.info('no element available?!', this.clipId, this.parentComp.clipToControlMap);
      return;
    }

    console.info('Adding Animation to Element: ', animationName);
    elementToAnimate.classList.add('animate__animated', animationName);

    const animationDuration = animationDurationValue || 777;

    console.info('duration', animationDurationValue);

    elementToAnimate.style.setProperty('--animate-duration', `${animationDuration}ms`);

    console.info('After Adding', elementToAnimate.classList.toString());
  }
  private removeAnimation(animationName: string) {
    const elementToAnimate =  this.getElementToAddAnimation();

    elementToAnimate.classList.remove('animate__animated');

    if (animationName) {
      console.info('Removing Animation from Element: ', animationName);
      elementToAnimate.classList.remove(animationName);
      console.info('After Remove', elementToAnimate.classList.toString());
    }
  }

  private cleanAllAnimationClasses() {
    const elementToAnimate = this.getElementToAddAnimation();

    const currentAnimateClasses: string[] = [];

    const classes = elementToAnimate.classList;

    for (let i = 0; i < classes.length; i++){
      const classItem = classes.item(i);

      if (classItem.includes('animate_')) {
        currentAnimateClasses.push(classItem);
      }
    }

    classes.remove(...currentAnimateClasses);
  }

  private getAnimationName (clipSettings: ScreenClip, animateIn: boolean) {
    let selectedAnimation = animateIn
      ? clipSettings.animationIn
      : clipSettings.animationOut;

    if (selectedAnimation === 'random') {
      selectedAnimation = this.randomAnimation(animateIn ? ANIMATION_IN_ARRAY : ANIMATION_OUT_ARRAY);
    }

    return selectedAnimation;
  }

  private randomAnimation(animations: string[]) {
    const randomIndex = Math.floor(Math.random() * animations.length);     // returns a random integer from 0 to 9

    return animations[randomIndex];
  }

  private triggerComponentIsShown() {
    const control = this.parentComp.clipToControlMap.get(this.clipId);

    if (control instanceof DynamicIframeComponent) {
      control.componentIsShown(this._currentTriggeredPayload);
    }
  }
}
