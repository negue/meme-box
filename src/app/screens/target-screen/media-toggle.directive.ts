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
import {Action, ActionType, CombinedActionContext, Dictionary, PositionEnum, VisibilityEnum} from "@memebox/contracts";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {mergeCombinedClipWithOverrides, TargetScreenComponent} from "./target-screen.component";
import {delay, map, skip, take, takeUntil} from "rxjs/operators";
import {DynamicIframeComponent} from "../../shared/components/dynamic-iframe/dynamic-iframe.component";
import {AppQueries, MemeboxWebsocketService} from "@memebox/app-state";
import {getWidgetFromActionInfo} from "@memebox/utils";

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
  public readonly mediaStateChanged = new EventEmitter<MediaState>();

  public isVisible$ = new BehaviorSubject<boolean>(false);


  private clipId$ = new BehaviorSubject(null);

  private currentState = MediaState.HIDDEN;
  private queueCounter = 0;
  private queueTrigger = new Subject<CombinedActionContext>();
  private currentActionContext: CombinedActionContext;
  private _destroy$ = new Subject();
  private clipVisibility: VisibilityEnum;
  private actionMap: Dictionary<Action>;

  constructor(private element: ElementRef<HTMLElement>,
              private parentComp: TargetScreenComponent,
              private webSocket: MemeboxWebsocketService,
              private renderer: Renderer2,
              private appQueries: AppQueries) {
    this.appQueries.actionMap$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this.actionMap = value;
    })
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

  ngOnChanges({clipId}: SimpleChanges): void {
    if (clipId) {
      this.clipId$.next(clipId);
    }
  }

  stopIfStillPlaying() {
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
      map(([newClipId, actionList]) => {
        const combinedActionContext = actionList.find(combined => combined.action.id
       === newClipId);

        return {
          combinedActionContext,
          newJsonToCompare: JSON.stringify({
            action: combinedActionContext.action,
            // backgroundColor: combinedActionContext.backgroundColor,
            screenMediaConfig: combinedActionContext.screenMediaConfig
          } as CombinedActionContext)
        };
      }),
      takeUntil(this._destroy$)
    ).subscribe(({
      combinedActionContext,
      newJsonToCompare
    }) => {
      const objToCompare: CombinedActionContext = {
        action: this.currentActionContext?.action,
        // backgroundColor: this.currentActionContext?.backgroundColor,
        screenMediaConfig: this.currentActionContext?.screenMediaConfig,
        originalClipSetting: undefined
      };

      const currentActionContextJson = JSON.stringify(objToCompare);

      if (currentActionContextJson === newJsonToCompare) {
        // nothing changed, ignore this
        return;
      }

      this.currentActionContext = combinedActionContext;

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
        this.currentActionContext = mergeCombinedClipWithOverrides(this.currentActionContext, triggerPayload);

        this.applyPositions();
        this.applyWidgetContent();
      }
    })

    this.queueTrigger.pipe(
      takeUntil(this._destroy$)
    ).subscribe((triggerEvent) => {
      this.currentActionContext = triggerEvent;
      this.log('Name: ', this.currentActionContext.action.name);
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
        const targetMediaState = this.currentActionContext.screenMediaConfig.animationIn
          ? MediaState.ANIMATE_IN
          : MediaState.VISIBLE;

        if (targetMediaState !== MediaState.ANIMATE_IN
          && !this.currentActionContext.screenMediaConfig.animating) {
          this.log('adding css class');
          this.element.nativeElement.classList.add('animationDisabled');
        }

        this.applyPositions();

        if (this.currentActionContext.action.type === ActionType.Widget
          && targetMediaState === MediaState.VISIBLE) {
          this.applyWidgetContent();
        }

        this.log('before trigger state', targetMediaState);

        if (targetMediaState !== MediaState.ANIMATE_IN
          && !this.currentActionContext.screenMediaConfig.animating) {
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
      if (toShow?.action?.id === this.clipId) {
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
    if (!this.currentActionContext) {
      return;
    }

    const {screenMediaConfig, backgroundColor} = this.currentActionContext;
    const currentPosition = screenMediaConfig.position;

    if (currentPosition === PositionEnum.Absolute) {
      this.element.nativeElement.style.setProperty('--clip-setting-left', screenMediaConfig.left);
      this.element.nativeElement.style.setProperty('--clip-setting-top', screenMediaConfig.top);
      this.element.nativeElement.style.setProperty('--clip-setting-right', screenMediaConfig.right);
      this.element.nativeElement.style.setProperty('--clip-setting-bottom', screenMediaConfig.bottom);
    }

    if (currentPosition === PositionEnum.Random) {
      const {height, width} = this.currentActionContext.screenMediaConfig;

      const randomPosition = () => Math.floor(Math.random()*100);

      const randomLeft = `max(0px, calc(${randomPosition()}% - ${width ?? '20%'}))`;
      const randomTop = `max(0px, calc(${randomPosition()}% - ${height ?? '10%'}))`;

      this.element.nativeElement.style.setProperty('--clip-setting-left', randomLeft);
      this.element.nativeElement.style.setProperty('--clip-setting-top', randomTop);

      const computedStyle = getComputedStyle(this.element.nativeElement);
      const {left, top} = computedStyle;

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

    if (screenMediaConfig.transform) {
      transformToApply += screenMediaConfig.transform;
    }

    this.element.nativeElement.style.setProperty('--clip-setting-transform', transformToApply);

    this.applyClass(this.element.nativeElement, 'absolute',
      screenMediaConfig.position === PositionEnum.Absolute);

    this.applyClass(this.element.nativeElement, 'centered',
      screenMediaConfig.position === PositionEnum.Centered);

    this.applyClass(this.element.nativeElement, 'random',
      screenMediaConfig.position === PositionEnum.Random);

    this.applyClass(this.element.nativeElement, 'fullscreen', !screenMediaConfig.position);


    this.element.nativeElement.style.setProperty('--clip-background', backgroundColor);
    this.element.nativeElement.style.setProperty('--clip-setting-img-fit', screenMediaConfig.imgFit);
    this.element.nativeElement.style.setProperty('z-index', `${screenMediaConfig.zIndex}`);

    if (screenMediaConfig.position !== PositionEnum.FullScreen) {
      this.element.nativeElement.style.setProperty('--clip-setting-height', screenMediaConfig.height);
      this.element.nativeElement.style.setProperty('--clip-setting-width', screenMediaConfig.width);
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
    const targetState = this.currentActionContext.screenMediaConfig.animationOut
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

    if (!this.currentActionContext) {
      return;
    }

    this.clipVisibility = this.currentActionContext.screenMediaConfig.visibility ?? VisibilityEnum.Play;

    setTimeout(() => {
      if (
        lastVisibility === VisibilityEnum.Static
        && this.clipVisibility !== VisibilityEnum.Static
      ) {
        this.isVisible$.next(false);
      }

      if (this.clipVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(this.currentActionContext.action.type)) {
          this.playMedia();
        }

        this.isVisible$.next(true);
      } else if (lastVisibility === VisibilityEnum.Static) {
        if(ALL_MEDIA.includes(this.currentActionContext.action.type)) {
          this.stopMedia();
        }
      }
    }, 100);
  }

  private playMedia() {
    const control = this.parentComp.clipToControlMap.get(this.currentActionContext.action.id);

    if (control instanceof HTMLAudioElement
      || control instanceof HTMLVideoElement) {
      control.currentTime = 0;

      this.attachGain(control);

      control.play();
    }

    if (control instanceof HTMLImageElement) {
      // reset if its a gif
      if (this.currentActionContext.action.path.includes('.gif')) {
        control.src = ''; // skipcq: JS-W1032 otherwise the gif isnt resetting
        control.src = this.currentActionContext.action.path;
      }
    }

    if (this.currentActionContext.action.playLength) {
      setTimeout(() => {
        this.stopIfStillPlaying();
      }, this.currentActionContext.action.playLength)
    }
  }

  private attachedGainAlready: Dictionary<boolean> = {};

  private attachGain(mediaElement: HTMLMediaElement) {
    const media = this.currentActionContext.action;
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
    const control = this.parentComp.clipToControlMap.get(this.currentActionContext.action.id);

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
        if (newState === this.currentState) {
          return;
        }

        this.cleanAllAnimationClasses();
        this.isVisible$.next(false);

        this.currentState = MediaState.HIDDEN;
        this.webSocket.updateMediaState(
          this.currentActionContext.action.id,
          this.screenId,
          false
        );

        this.stopMedia();

        if (this.clipVisibility !== VisibilityEnum.Toggle) {
          this.queueCounter--;
          this.queueTrigger.next(this.currentActionContext);
        }

        return;
      }
      case MediaState.ANIMATE_IN:
      {
        this.startAnimation(this.currentActionContext.screenMediaConfig.animationIn, this.currentActionContext.screenMediaConfig.animationInDuration);

        if (this.currentActionContext.action.type === ActionType.Widget) {
          this.applyWidgetContent();
        }

        this.isVisible$.next(true);

        break;
      }
      case MediaState.VISIBLE:
      {
        this.isVisible$.next(true);
        this.removeAnimation(this.currentActionContext.screenMediaConfig.animationIn);
        this.triggerComponentIsShown();

        // "once its done"
        this.stopMedia();
        this.playMedia();

        this.webSocket.updateMediaState(
          this.currentActionContext.action.id,
          this.screenId,
          true
        );

        break;
      }
      case MediaState.ANIMATE_OUT:
      {
        const animateOut = this.currentActionContext.screenMediaConfig.animationOut;
        this.startAnimation(animateOut, this.currentActionContext.screenMediaConfig.animationOutDuration);

        this.stopMedia();

        break;
      }
    }

    this.currentState = newState;
  }

  private getElementToAddAnimation() {
    // this.parentComp.clipToControlMap.get(this.currentActionContext.clip.id);

    return this.mediaHoldingElement;
  }

  private startAnimation(animationName: string, animationDurationValue: number) {
    this.element.nativeElement.classList.add('isAnimating');

    const elementToAnimate = this.getElementToAddAnimation();

    if (!elementToAnimate) {
      return;
    }

    elementToAnimate.classList.add('animate__animated', animationName);

    const animationDuration = animationDurationValue || 777;
    elementToAnimate.style.setProperty('--animate-duration', `${animationDuration}ms`);
  }
  private removeAnimation(animationName: string) {
    this.element.nativeElement.classList.remove('isAnimating');
    const elementToAnimate =  this.getElementToAddAnimation();

    elementToAnimate.classList.remove('animate__animated');

    if (animationName) {
      elementToAnimate.classList.remove(animationName);
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
    const control = this.parentComp.clipToControlMap.get(this.currentActionContext.action.id);

    if (control instanceof DynamicIframeComponent) {
      control.componentIsShown(this.currentActionContext.triggerPayload);
    }
  }

  private applyWidgetContent() {
    if (!this.currentActionContext) {
      return;
    }

    const variableOverrides = this.currentActionContext.triggerPayload?.overrides?.action?.variables ?? {};

    const config = getWidgetFromActionInfo(
      this.currentActionContext.action,
      this.actionMap, variableOverrides
    );

    const control = this.parentComp.clipToControlMap.get(
      this.currentActionContext.action.id
    );

    if (control instanceof DynamicIframeComponent) {
      control.content = config;
      control.handleContentUpdate();
    }
  }

  private log(...args: unknown[]) {
    console.info(`[${this.currentActionContext.action.id}]`, ...args);
  }
}
