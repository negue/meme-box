import type {Rule} from 'css';
import * as css from 'css';
import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {
  Action,
  ActionType,
  ANIMATION_IN_ARRAY,
  ANIMATION_OUT_ARRAY,
  CombinedClip,
  Screen,
  ScreenClip,
  TriggerAction
} from "@memebox/contracts";
import {distinctUntilChanged, filter, map, take, takeUntil} from "rxjs/operators";
import {AppQueries, AppService, ConnectionState, MemeboxWebsocketService} from "@memebox/app-state";
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

  mediaList$: Observable<CombinedClip[]> = combineLatest([
    this.assignedClipsMap$,
    this.appQuery.actionMap$
  ]).pipe(
    map(([assignedMedia, allActions]) => {
      const result: CombinedClip[] = [];

      for (const [key, clipSetting] of Object.entries(assignedMedia)) {
        result.push({
          clipSetting,
          originalClipSetting: clipSetting,
          clip: {
            ...allActions[key]
          },
          backgroundColor: this.random_rgba()
        });
      }

      return result;
    })
  );
  mediaClipToShow$ = new BehaviorSubject<CombinedClip>(null);
  mediaClipControlAdded$ = new BehaviorSubject<string>(null);
  clipToControlMap = new Map<string, HTMLVideoElement | HTMLAudioElement | HTMLImageElement | HTMLIFrameElement>();

  showOfflineIcon$ = this.wsService.connectionState$.pipe(
    map(value => ![ConnectionState.Connected, ConnectionState.Offline].includes(value))
  );

  ConnectionState = ConnectionState;

  screen$ = combineLatest([
    this.screenId$,
    this.appQuery.screenMap$
  ]).pipe(
    map(([screenId, screenMap]) => {
      return screenMap[screenId];
    })
  );

  trackByKeyValue: TrackByFunction<KeyValue<string, CombinedClip>> = (index, item) => {
    return item.key;
  }

  @Input()
  public screenId: string = '';

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

        combinedClip.clipSetting.animationIn = this.getAnimationName(combinedClip, true);
        combinedClip.clipSetting.animationOut = this.getAnimationName(combinedClip, false);

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
        const customCss = screenClipSettings.clipSetting.customCss
          ? this.toScreenClipCssAgain(screenClipSettings.clipSetting)
          : '';

        this.addOrUpdateStyleTag(document, screenClipSettings.clipSetting.id, customCss);

        if (!screenClipSettings.clip)  {
          return;
        }

        if (screenClipSettings.clip.type === ActionType.IFrame) {
          const item = this.clipToControlMap.get(screenClipSettings.clip.id) as HTMLIFrameElement;

          if (item && item.contentDocument) {
            this.addOrUpdateStyleTag(item.contentDocument, 'iframe', screenClipSettings.clipSetting.customCss ?? '');
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

        const foundMedia = map.find(e => e.clip.id === value.id);

        const iframeCss =  foundMedia.clipSetting.customCss;

        this.addOrUpdateStyleTag(iframeElement.contentDocument, 'iframe', iframeCss);
      } )
    }

    if (value.type === ActionType.Widget){
      this.mediaList$.pipe(
        take(1)
      ).subscribe(map => {
        // custom css for custom html?!
      } )
    }

    this.mediaClipControlAdded$.next(value.id);
  }

  random_rgba() {
    const o = Math.round, r = Math.random, s = 255;
    return `rgba(${o(r() * s)},${o(r() * s)},${o(r() * s)},0.34)`;
  }

  parseAndApplyClipCssRules(screenClip: ScreenClip): css.Stylesheet {
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

  toScreenClipCssAgain(screenClip: ScreenClip): string {
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
  ): Promise<CombinedClip> {
    const currentMediaList = await this.mediaList$.pipe(
      take(1)
    ).toPromise();

    const foundById = currentMediaList.find(m => m.clip.id === triggerPayload.id);

    return mergeCombinedClipWithOverrides(foundById, triggerPayload);
  }

  private getAnimationName (combinedClip: CombinedClip, animateIn: boolean) {
    let selectedAnimation = animateIn
      ? combinedClip.clipSetting.animationIn
      : combinedClip.clipSetting.animationOut;

    if (selectedAnimation === 'random') {
      selectedAnimation = this.randomAnimation(animateIn
        ? ANIMATION_IN_ARRAY
        : ANIMATION_OUT_ARRAY
      );
    }

    return selectedAnimation;
  }

  private randomAnimation(animations: string[]) {
    var randomIndex = Math.floor(Math.random() * animations.length);     // returns a random integer from 0 to 9

    return animations[randomIndex];
  }

}

export function mergeCombinedClipWithOverrides (
  sourceCombinedClip: CombinedClip,
  triggerPayload: TriggerAction
) {
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
    clipSetting,
    triggerPayload
  };
}
