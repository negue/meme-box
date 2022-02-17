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
  Renderer2,
  SimpleChanges
} from '@angular/core';
import {Action, ActionType, CombinedClip, Dictionary, PositionEnum, VisibilityEnum} from "@memebox/contracts";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {mergeCombinedClipWithOverrides, TargetScreenComponent} from "./target-screen.component";
import {delay, skip, take, takeUntil} from "rxjs/operators";
import {DynamicIframeComponent} from "../../shared/components/dynamic-iframe/dynamic-iframe.component";
import {AppQueries, MemeboxWebsocketService} from "@memebox/app-state";
import {actionDataToWidgetContent, DynamicIframeContent} from "@memebox/utils";

export enum MediaState {
  HIDDEN,
  ANIMATE_IN,
  VISIBLE,
  ANIMATE_OUT
}

// TODO POSSIBLE TO SPLIT UP?
// TODO add more debug logs if needed foranother debugging sessions

const ALL_MEDIA = [ActionType.Audio, ActionType.Video];

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

  private currentState = MediaState.HIDDEN;
  private queueCounter = 0;
  private queueTrigger = new Subject<CombinedClip>();
  private currentCombinedClip: CombinedClip;
  private _destroy$ = new Subject();
  private clipVisibility: VisibilityEnum;
  private clipMap: Dictionary<Action>;

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent,
              private webSocket: MemeboxWebsocketService,
              private renderer: Renderer2,
              private appQueries: AppQueries) {
    this.appQueries.actionMap$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this.clipMap = value;
    })
  }

  @HostListener('animationend', ['$event'])
  onAnimationEnd(event: any) {
    console.info(this.clipId, this.currentState, 'animationend', event);
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

  ngOnChanges({clipId}: SimpleChanges): void {
    if (clipId) {
      this.clipId$.next(clipId);
    }
  }

  stopIfStillPlaying() {
    console.info('stopifPlaying', {
      animationOut: this.currentCombinedClip.clipSetting.animationOut,
      state: this.currentState,
      clipVisibility: this.clipVisibility,
      currentState: this.currentState
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
    this.clipId$.next(this.clipId);

    combineLatest([
      this.clipId$,
      this.parentComp.mediaList$
    ]).pipe(
      takeUntil(this._destroy$)
    ).subscribe(async ([newClipId, mediaClipList]) => {
      const combinedClip = mediaClipList.find(combined => combined.clip.id
       === newClipId);

      this.currentCombinedClip = combinedClip;

      this.updateNeededVariables();
      this.applyPositions();
      this.applyWidgetContent();
    });

    // temporary update of a visible media (probably from scripts)
    this.webSocket.onUpdateMedia$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(triggerPayload => {
      if (
        this.clipId === triggerPayload.id &&
        this.screenId == triggerPayload.targetScreen
      ) {
        this.currentCombinedClip = mergeCombinedClipWithOverrides(this.currentCombinedClip, triggerPayload);

        this.applyPositions();
        this.applyWidgetContent();
      }
    })

    this.queueTrigger.pipe(
      takeUntil(this._destroy$)
    ).subscribe((triggerEvent) => {
      this.currentCombinedClip = triggerEvent;
      this.log('Name: ', this.currentCombinedClip.clip.name);
      this.log('Queue Trigger - Subscribe', this.queueCounter);

      if (this.clipVisibility !== VisibilityEnum.Toggle && this.queueCounter <= 0) {
        this.log('not toggle - no queue - exiting');
        return;
      }

      this.log({
        visibility: this.clipVisibility,
        currentState: this.currentState
      });

      if (this.clipVisibility === VisibilityEnum.Toggle && this.currentState === MediaState.VISIBLE) {
        this.log('Was toggle and currently visible -> animate Out or Hide');
        this.animateOutOrHide();
      } else {
        this.updateNeededVariables();
        const targetMediaState = this.currentCombinedClip.clipSetting.animationIn
          ? MediaState.ANIMATE_IN
          : MediaState.VISIBLE;

        if (targetMediaState !== MediaState.ANIMATE_IN
          && !this.currentCombinedClip.clipSetting.animating) {
          this.log('adding css class');
          this.element.nativeElement.classList.add('animationDisabled');
        }

        this.applyPositions();

        if (this.currentCombinedClip.clip.type === ActionType.Widget
          && targetMediaState === MediaState.VISIBLE) {
          this.applyWidgetContent();
        }

        this.log('before trigger state', targetMediaState);

        if (targetMediaState !== MediaState.ANIMATE_IN
          && !this.currentCombinedClip.clipSetting.animating) {
          this.isVisible$.pipe(
            skip(1),
            delay(300),
            take(1)
          ).subscribe(() => {
            this.element.nativeElement.classList.remove('animationDisabled');
          })
        }

        // Trigger Play
        this.triggerState(targetMediaState);
      }
    })

    // this.parentComp.mediaClipToShow$  => fill up a queue

    // trigger only if one isnt currently running
    // once done it should trigger the next one

    this.parentComp.mediaClipToShow$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(toShow => {
      if (toShow?.clip?.id === this.clipId) {
        if (this.clipVisibility === VisibilityEnum.Toggle) {
          console.info('toggle - just add it to the queue');
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

    this.parentComp.mediaClipControlAdded$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(componentAdded => {
      if (componentAdded === this.clipId) {
        this.updateNeededVariables();
        this.applyPositions();
        this.applyWidgetContent();
      }
    })
  }

  private applyPositions() {
    if (!this.currentCombinedClip) {
      return;
    }

    const {clipSetting, clip, backgroundColor} = this.currentCombinedClip;
    const currentPosition = clipSetting.position;

    console.info({
      clipSettings: this.currentCombinedClip.clipSetting
    });
    if (currentPosition === PositionEnum.Absolute) {
      this.element.nativeElement.style.setProperty('--clip-setting-left', clipSetting.left);
      this.element.nativeElement.style.setProperty('--clip-setting-top', clipSetting.top);
      this.element.nativeElement.style.setProperty('--clip-setting-right', clipSetting.right);
      this.element.nativeElement.style.setProperty('--clip-setting-bottom', clipSetting.bottom);

      console.info('Applied Positions', {clipSetting});
    }

    if (currentPosition === PositionEnum.Random) {
      console.warn('RAMDOM');
      const {height, width} = this.currentCombinedClip.clipSetting;

      const randomPosition = () => Math.floor(Math.random()*100);

      const randomLeft = `max(0px, calc(${randomPosition()}% - ${width ?? '20%'}))`;
      const randomTop = `max(0px, calc(${randomPosition()}% - ${height ?? '10%'}))`;

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

    let transformToApply = '';

    if (currentPosition === PositionEnum.Centered) {
      transformToApply = 'translate(-50%, -50%) ';
    }

    if (clipSetting.transform) {
      transformToApply += clipSetting.transform;
    }

    console.info({transformToApply, clipSetting});

    this.element.nativeElement.style.setProperty('--clip-setting-transform', transformToApply);

    this.applyClass(this.element.nativeElement, 'absolute',
      clipSetting.position === PositionEnum.Absolute);

    this.applyClass(this.element.nativeElement, 'centered',
      clipSetting.position === PositionEnum.Centered);

    this.applyClass(this.element.nativeElement, 'random',
      clipSetting.position === PositionEnum.Random);

    this.applyClass(this.element.nativeElement, 'fullscreen', !clipSetting.position);


    this.element.nativeElement.style.setProperty('--clip-background', backgroundColor);
    this.element.nativeElement.style.setProperty('--clip-setting-img-fit', clipSetting.imgFit);
    this.element.nativeElement.style.setProperty('z-index', ''+clipSetting.zIndex);

    if (clipSetting.position !== PositionEnum.FullScreen) {
      this.element.nativeElement.style.setProperty('--clip-setting-height', clipSetting.height);
      this.element.nativeElement.style.setProperty('--clip-setting-width', clipSetting.width);
    } else {
      this.element.nativeElement.style.setProperty('--clip-setting-height', null);
      this.element.nativeElement.style.setProperty('--clip-setting-width', null);
    }
  }

  private applyClass(targetElement: HTMLElement,
                      className: string,
                      conditionToAdd: boolean) {

    // clean up before - just to be sure
    this.renderer.removeClass(targetElement, className);

    if(conditionToAdd) {
      this.renderer.addClass(targetElement, className);
    } else {
      this.renderer.removeClass(targetElement, className);
    }
  }

  private animateOutOrHide() {
    const targetState = this.currentCombinedClip.clipSetting.animationOut
      ? MediaState.ANIMATE_OUT
      : MediaState.HIDDEN;

    this.triggerState(targetState);
  }

  /**
   * Is it still needed?
   *
   * @private
   */
  private updateNeededVariables() {
    const lastVisibility = this.clipVisibility;

    if (!this.currentCombinedClip) {
      return;
    }

    this.clipVisibility = this.currentCombinedClip.clipSetting.visibility ?? VisibilityEnum.Play;

    setTimeout(() => {
      if (
        lastVisibility === VisibilityEnum.Static
        && this.clipVisibility !== VisibilityEnum.Static
      ) {
        this.isVisible$.next(false);
      }

      if (this.clipVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(this.currentCombinedClip.clip.type)) {
          this.playMedia();
        }

        this.isVisible$.next(true);
      } else if (lastVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(this.currentCombinedClip.clip.type)) {
          this.stopMedia();
        }
      }
    }, 100);
  }

  private playMedia() {
    const control = this.parentComp.clipToControlMap.get(this.currentCombinedClip.clip.id);

    if (control instanceof HTMLAudioElement
      || control instanceof HTMLVideoElement) {
      control.currentTime = 0;
      console.info('Media Play triggered');

      this.attachGain(control);

      control.play().then(() => {
        console.info('Media Play done');
      });
    }

    if (control instanceof HTMLImageElement) {
      // reset if its a gif
      if (this.currentCombinedClip.clip.path.includes('.gif')) {
        control.src = '';
        control.src = this.currentCombinedClip.clip.path;
      }
    }

    if (this.currentCombinedClip.clip.playLength) {
      setTimeout(() => {
        this.stopIfStillPlaying();
      }, this.currentCombinedClip.clip.playLength)
    }
  }

  private attachedGainAlready: Dictionary<boolean> = {};

  private attachGain(mediaElement: HTMLMediaElement) {
    const media = this.currentCombinedClip.clip;
    const gainSetting = media.gainSetting;

    if (!gainSetting || this.attachedGainAlready[media.id]) {
      return;
    }

    // create an audio context and hook up the video element as the source
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(mediaElement);

// create a gain node
    const valueToGain = Math.fround(gainSetting / 100);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = valueToGain; // double the volume
    source.connect(gainNode);

// connect the gain node to an output destination
    gainNode.connect(audioCtx.destination);

    this.attachedGainAlready[media.id]  = true;
  }

  private stopMedia () {
    const control = this.parentComp.clipToControlMap.get(this.currentCombinedClip.clip.id);

    if (control instanceof HTMLMediaElement) {
      control.pause();
      control.currentTime = 0;
    }
  }

  private triggerState(newState: MediaState) {
    this.mediaStateChanged.emit(newState);

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
          this.currentCombinedClip.clip.id,
          this.screenId,
          false
        );

        this.stopMedia();

        if (this.clipVisibility !== VisibilityEnum.Toggle) {
          this.queueCounter--;
          this.queueTrigger.next(this.currentCombinedClip);
        }

        console.info('MEDIA DONE - Queue Counter', this.queueCounter);

        return;
      }
      case MediaState.ANIMATE_IN:
      {
        console.warn('changing to ANIMATE_IN');
        this.startAnimation(this.currentCombinedClip.clipSetting.animationIn, this.currentCombinedClip.clipSetting.animationInDuration);

        if (this.currentCombinedClip.clip.type === ActionType.Widget) {
          this.applyWidgetContent();
        }

        this.isVisible$.next(true);

        break;
      }
      case MediaState.VISIBLE:
      {
        console.warn('changing to VISIBLE');
        this.isVisible$.next(true);
        this.removeAnimation(this.currentCombinedClip.clipSetting.animationIn);
        this.triggerComponentIsShown();

        // "once its done"
        this.stopMedia();
        this.playMedia();

        this.webSocket.updateMediaState(
          this.currentCombinedClip.clip.id,
          this.screenId,
          true
        );

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        const animateOut = this.currentCombinedClip.clipSetting.animationOut;
        console.warn('Animation OUT', animateOut, this.currentCombinedClip.clipSetting);
        this.startAnimation(animateOut, this.currentCombinedClip.clipSetting.animationOutDuration);

        this.stopMedia();

        break;
      }
    }

    this.currentState = newState;
  }

  private getElementToAddAnimation() {
    // this.parentComp.clipToControlMap.get(this.currentCombinedClip.clip.id);

    return this.mediaHoldingElement;
  }

  private startAnimation(animationName: string, animationDurationValue: number) {
    this.element.nativeElement.classList.add('isAnimating');

    const elementToAnimate = this.getElementToAddAnimation();

    if (!elementToAnimate) {
      console.info('no element available?!', this.currentCombinedClip, this.parentComp.clipToControlMap);
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
    this.element.nativeElement.classList.remove('isAnimating');
    const elementToAnimate =  this.getElementToAddAnimation();

    elementToAnimate.classList.remove('animate__animated');

    if (animationName) {
      console.info('Removing Animation from Element: ', animationName);
      elementToAnimate.classList.remove(animationName);
      console.info('After Remove', elementToAnimate.classList.toString());
    }
  }

  private cleanAllAnimationClasses() {
    this.element.nativeElement.classList.remove('isAnimating');

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


  private triggerComponentIsShown() {
    const control = this.parentComp.clipToControlMap.get(this.currentCombinedClip.clip.id);

    if (control instanceof DynamicIframeComponent) {
      control.componentIsShown(this.currentCombinedClip.triggerPayload);
    }
  }

  private applyWidgetContent() {

    const variableOverrides = this.currentCombinedClip.triggerPayload?.overrides?.action?.variables ?? {};

    const media = this.currentCombinedClip.clip;

    let config: DynamicIframeContent;

    if (media.fromTemplate) {
      const widgetTemplate = this.clipMap[media.fromTemplate];

      config = {
        ...actionDataToWidgetContent(widgetTemplate),
        variables: {
          ...media.extended,
          ...variableOverrides
        }
      };
    } else {
      config = {
        ...actionDataToWidgetContent(media),
        variables: variableOverrides
      };

    }

    console.info({
      variableOverrides,
      config
    })

    const control = this.parentComp.clipToControlMap.get(this.currentCombinedClip.clip.id);

    if (control instanceof DynamicIframeComponent) {
      control.content = config;
      control.handleContentUpdate();
    }
  }

  private log(...args: unknown[]) {
    console.info(`[${this.currentCombinedClip.clip.id}]`, ...args);
  }
}
