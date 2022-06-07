import type {Rule} from 'css';
import * as css from 'css';
import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {
  Action,
  ActionType,
  ANIMATION_IN_ARRAY,
  ANIMATION_OUT_ARRAY,
  CombinedActionContext,
  Screen,
  ScreenMedia,
  TriggerAction
} from "@memebox/contracts";
import {distinctUntilChanged, filter, map, take, takeUntil} from "rxjs/operators";
import {AppQueries, AppService, ConnectionStateEnum, MemeboxWebsocketService} from "@memebox/app-state";
import {ActivatedRoute} from "@angular/router";
import {KeyValue} from "@angular/common";

// TODO Extract Target-Screen Component from the PAGE itself

@Component({
  selector: 'app-target-screen',
  templateUrl: './target-screen.component.html',
  styleUrls: ['./target-screen.component.scss']
})
export class TargetScreenComponent implements OnInit, OnDestroy {

  log: unknown[] = [];

  debug$ = this.route.queryParams.pipe(
    map(queryParams => queryParams['debug'] === 'true')
  );

  screenId$ = new BehaviorSubject<string>(null);

  assignedClipsMap$ = combineLatest([
    this.screenId$.pipe(
      filter(screenId => !!screenId)
    ),
    this.appQuery.screenMap$.pipe(
      filter(screenMap => !!screenMap)
    )
  ]).pipe(
    filter(([screenId, screenMap]) => !!screenMap[screenId]),
    map(([screenId, screenMap]) => screenMap[screenId].clips)
  );

  mediaList$: Observable<CombinedActionContext[]> = combineLatest([
    this.assignedClipsMap$,
    this.appQuery.actionMap$
  ]).pipe(
    map(([assignedMedia, allActions]) => {
      const result: CombinedActionContext[] = [];

      for (const [key, clipSetting] of Object.entries(assignedMedia)) {
        result.push({
          screenMediaConfig: clipSetting,
          originalClipSetting: clipSetting,
          action: {
            ...allActions[key]
          },
          backgroundColor: this.random_rgba()
        });
      }

      return result;
    })
  );
  mediaClipToShow$ = new BehaviorSubject<CombinedActionContext>(null);
  mediaClipControlAdded$ = new BehaviorSubject<string>(null);
  clipToControlMap = new Map<string, HTMLVideoElement | HTMLAudioElement | HTMLImageElement | HTMLIFrameElement>();

  showOfflineIcon$ = this.wsService.connectionState$.pipe(
    map(value => ![ConnectionStateEnum.Connected, ConnectionStateEnum.Offline].includes(value))
  );

  ConnectionState = ConnectionStateEnum;

  screen$ = combineLatest([
    this.screenId$,
    this.appQuery.screenMap$
  ]).pipe(
    map(([screenId, screenMap]) => {
      return screenMap[screenId];
    })
  );

  trackByKeyValue: TrackByFunction<KeyValue<string, CombinedActionContext>> = (index, item) => {
    return item.key;
  }

  @Input()
  public screenId = '';

  @HostBinding('id')
  public get cssId() {
    return `screen-${this.screenId}`;
  }

  private _destroy$ = new Subject();


  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private route: ActivatedRoute,
              private wsService: MemeboxWebsocketService,
              private element: ElementRef<HTMLElement>) {
  }


  ngOnInit(): void {
    this.appService.loadState();

    this.debug$.pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(value => {
      if (value) {
        this.element.nativeElement.classList.add('debug-mode');
      } else{
        this.element.nativeElement.classList.remove('debug-mode');
      }
    })


    this.wsService.onOpenConnection$.pipe(
      take(1)
    ).subscribe(value => {
      this.wsService.sendI_Am_OBS(this.screenId);
    })

    this.wsService.onUpdateData$.pipe(
      takeUntil(this._destroy$),
    ).subscribe(value => {
      this.appService.loadState();
    });

    this.wsService.onTriggerAction$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(async triggerPayload => {
      if (triggerPayload.targetScreen === this.screenId) {
        const combinedClip = await this.getCombinedClipWithOverridingOptionsAsync(triggerPayload);

        combinedClip.screenMediaConfig.animationIn = this.getAnimationName(combinedClip, true);
        combinedClip.screenMediaConfig.animationOut = this.getAnimationName(combinedClip, false);

        this.mediaClipToShow$.next(combinedClip);
      }
    });

    this.wsService.onReloadScreen$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      location.reload();
    });

    this.wsService.onReconnection$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      location.reload();
    });

    this.screenId$.next(this.screenId);

    this.mediaList$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(mediaClipMap => {
      for(const screenClipSettings of Object.values(mediaClipMap)){
        const customCss = screenClipSettings.screenMediaConfig.customCss
          ? this.toScreenClipCssAgain(screenClipSettings.screenMediaConfig)
          : '';

        this.addOrUpdateStyleTag(document, screenClipSettings.screenMediaConfig.id, customCss);

        if (!screenClipSettings.action)  {
          return;
        }

        if (screenClipSettings.action.type === ActionType.IFrame) {
          const item = this.clipToControlMap.get(screenClipSettings.action.id) as HTMLIFrameElement;

          if (item && item.contentDocument) {
            this.addOrUpdateStyleTag(item.contentDocument, 'iframe', screenClipSettings.screenMediaConfig.customCss ?? '');
          }
        }
      }
    });

    this.screen$.pipe(
      filter(screen => !!screen),

      takeUntil(this._destroy$)
    ).subscribe(screen => {
      const customCss = screen.customCss
        ? this.toScreenCssAgain(screen)
        : '';

      // console.info('ADDING SCreen Custom CSS', customCss);

      this.addOrUpdateStyleTag(document, screen.id, customCss);
    });
  }

  addLog(load: string, $event: Event) {
    // console.info({load, $event});

    this.log.push({
      load,
      $event,
      time: new Date()
    });
  }

  addToMap(value: Action, element: any) {
    this.clipToControlMap.set(value.id, element);

    if (value.type === ActionType.IFrame){

      // console.warn('Is Iframe');
      this.mediaList$.pipe(
        take(1)
      ).subscribe(map => {
        const iframeElement = element as HTMLIFrameElement;

        const foundMedia = map.find(e => e.action.id === value.id);

        const iframeCss =  foundMedia.screenMediaConfig.customCss;

        this.addOrUpdateStyleTag(iframeElement.contentDocument, 'iframe', iframeCss);
      } )
    }

    this.mediaClipControlAdded$.next(value.id);
  }

  random_rgba() {
    const o = Math.round, r = Math.random, s = 255;
    return `rgba(${o(r() * s)},${o(r() * s)},${o(r() * s)},0.34)`;
  }

  parseAndApplyClipCssRules(screenClip: ScreenMedia): css.Stylesheet {
    const obj = css.parse(screenClip.customCss, {
      silent: true
    });
    // css.stringify(obj, options);

    obj.stylesheet.rules.forEach(rule => {
      if (rule.type === 'rule') {
        const normalRule = rule as Rule;

        normalRule.selectors = normalRule.selectors.map(sel => {
          const withSpace = !sel.includes('.clip-holder');

          return `.clip-${screenClip.id}${withSpace ? ' ': ''}${sel}`;
        });
      }
    })

    return obj;
  }


  parseAndApplyScreenCssRules(screen: Screen) {
    const obj = css.parse(screen.customCss ?? '', {
      silent: true
    });
    // css.stringify(obj, options);

    obj.stylesheet.rules.forEach(rule => {
      if (rule.type === 'rule') {
        const normalRule = rule as Rule;

        normalRule.selectors = normalRule.selectors.map(sel => {
          const screenSelector = sel.includes('screen');


          return `#screen-${screen.id} ${screenSelector ? '' : sel}`;
        });
      }
    })

    return obj;
  }


  addOrUpdateStyleTag(document: Document, styleId: string, customCss: string) {
    if (!document || !customCss) {
      // depending on the browser there is no document of an iframe...
      // or if the css is empty, no need to continue here
      return;
    }

    // todo use the @gewd package to add the style
    const head = document.getElementsByTagName('head')[0];
    const allStyles = head.getElementsByTagName('style');
    let style: HTMLStyleElement|null = null;

    for (let styleIndex = 0; styleIndex < allStyles.length; styleIndex++) {
      const styleInHeader = allStyles.item(styleIndex);

      if (styleInHeader?.id === styleId) {
        style = styleInHeader;
        break;
      }
    }

    if (style === null) {
      style = document.createElement('style');
      style.id = styleId;
      style.type = 'text/css';
      head.appendChild(style);
    }

    if (style?.childNodes.length > 0) {
      // console.info('Rules in the Style', styleId);
      // console.info('Childnodes', style.childNodes);

      style.childNodes.forEach(child => {
        // console.info('Removing', child);
        style?.removeChild(child);
      })
    }

    style.appendChild(document.createTextNode(customCss));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  toScreenClipCssAgain(screenClip: ScreenMedia): string {
    const obj = this.parseAndApplyClipCssRules(screenClip);

    if (obj.stylesheet.parsingErrors) {
      return screenClip.customCss;
    }

    return css.stringify(obj);
  }

  toScreenCssAgain(screen: Screen) {
    const obj = this.parseAndApplyScreenCssRules(screen);

    return css.stringify(obj);
  }

  async getCombinedClipWithOverridingOptionsAsync(
    triggerPayload: TriggerAction
  ): Promise<CombinedActionContext> {
    const currentMediaList = await this.mediaList$.pipe(
      take(1)
    ).toPromise();

    const foundById = currentMediaList.find(m => m.action.id === triggerPayload.id);

    return mergeCombinedClipWithOverrides(foundById, triggerPayload);
  }

  private getAnimationName (combinedClip: CombinedActionContext, animateIn: boolean) {
    let selectedAnimation = animateIn
      ? combinedClip.screenMediaConfig.animationIn
      : combinedClip.screenMediaConfig.animationOut;

    if (selectedAnimation === 'random') {
      selectedAnimation = this.randomAnimation(animateIn
        ? ANIMATION_IN_ARRAY
        : ANIMATION_OUT_ARRAY
      );
    }

    return selectedAnimation;
  }

  private randomAnimation(animations: string[]) {
    const randomIndex = Math.floor(Math.random() * animations.length);     // returns a random integer from 0 to 9

    return animations[randomIndex];
  }

}

export function mergeCombinedClipWithOverrides (
  sourceCombinedClip: CombinedActionContext,
  triggerPayload: TriggerAction
): CombinedActionContext {
  let clipSetting = Object.assign({}, sourceCombinedClip.originalClipSetting);

  if (triggerPayload.useOverridesAsBase) {
    sourceCombinedClip.originalClipSetting = Object.assign({},
      sourceCombinedClip.originalClipSetting,
      triggerPayload.overrides.screenMedia);
  }

  if (triggerPayload.overrides?.screenMedia) {
    clipSetting = Object.assign({}, sourceCombinedClip.originalClipSetting, triggerPayload.overrides.screenMedia);
  }

  return {
    ...sourceCombinedClip,
    screenMediaConfig: clipSetting,
    triggerPayload
  };
}
