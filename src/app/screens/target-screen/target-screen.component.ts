import type {Rule} from 'css';
import * as css from 'css';
import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Clip, CombinedClip, Dictionary, MediaType, Screen, ScreenClip} from "@memebox/contracts";
import {distinctUntilChanged, filter, map, take, takeUntil} from "rxjs/operators";
import {AppQueries} from "../../state/app.queries";
import {AppService} from "../../state/app.service";
import {ActivatedRoute} from "@angular/router";
import {KeyValue} from "@angular/common";
import {ConnectionState, WebsocketService} from "../../core/services/websocket.service";

// TODO Extract Target-Screen Component from the PAGE itself

@Component({
  selector: 'app-target-screen',
  templateUrl: './target-screen.component.html',
  styleUrls: ['./target-screen.component.scss']
})
export class TargetScreenComponent implements OnInit, OnDestroy {

  log = [];

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

  mediaClipMap$: Observable<Dictionary<CombinedClip>> = combineLatest([
    this.assignedClipsMap$,
    this.appQuery.clipMap$
  ]).pipe(
    map(([assignedClips, allClips]) => {
      const result: Dictionary<CombinedClip> = {};

      for (const [key, entry] of Object.entries(assignedClips)) {
        result[key] = {
          clipSetting: entry,
          clip: {
            ...allClips[key]
          },
          backgroundColor: this.random_rgba()
        }
      }

      return result;
    })
  );
  mediaClipToShow$ = new BehaviorSubject<string>(null);
  clipToControlMap = new Map<string, HTMLVideoElement | HTMLAudioElement | HTMLImageElement | HTMLIFrameElement>();

  connectionState$ = this.wsService.connectionState$;

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
  public screenId : string;

  @HostBinding('id')
  public get cssId() {
    return `screen-${this.screenId}`;
  }

  private _destroy$ = new Subject();


  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private route: ActivatedRoute,
              private wsService: WebsocketService,
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

    this.wsService.onTriggerClip$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(clip => {
      if (clip.targetScreen === this.screenId) {
        this.mediaClipToShow$.next(clip.id);
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

    this.mediaClipMap$.pipe(
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

        if (screenClipSettings.clip.type === MediaType.IFrame) {
          const item = this.clipToControlMap.get(screenClipSettings.clip.id) as HTMLIFrameElement;

          if (item) {
            console.info({document: item.contentDocument});
            this.addOrUpdateStyleTag(item.contentDocument, 'iframe', screenClipSettings.clipSetting.customCss);
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

      console.info('ADDING SCreen Custom CSS', customCss);

      this.addOrUpdateStyleTag(document, screen.id, customCss);
    });
  }

  addLog(load: string, $event: Event) {
    console.info({load, $event});

    this.log.push({
      load,
      $event,
      time: new Date()
    });

    console.info({log: this.log});
  }

  addToMap(value: Clip, element: any) {
    this.clipToControlMap.set(value.id, element);

    if (value.type === MediaType.IFrame){

      console.warn('Is Iframe');
      this.mediaClipMap$.pipe(
        take(1)
      ).subscribe(map => {
        const iframeElement = element as HTMLIFrameElement;

        const iframeCss = map[value.id].clipSetting.customCss;

        console.warn({
          document: iframeElement.contentDocument,
          iframeCss
        });

        this.addOrUpdateStyleTag(iframeElement.contentDocument, 'iframe', iframeCss);

      } )
    }

    if (value.type === MediaType.HTML){

      console.warn('Is HTML (iframe)');
      this.mediaClipMap$.pipe(
        take(1)
      ).subscribe(map => {
        // custom css for custom html?!
      } )
    }
  }

  random_rgba() {
    const o = Math.round, r = Math.random, s = 255;
    return `rgba(${o(r() * s)},${o(r() * s)},${o(r() * s)},0.34)`;
  }

  parseAndApplyClipCssRules(screenClip: ScreenClip) {

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
    const obj = css.parse(screen.customCss, {
      silent: true
    });
    // css.stringify(obj, options);

    obj.stylesheet.rules.forEach(rule => {
      if (rule.type === 'rule') {
        const normalRule = rule as Rule;

        normalRule.selectors = normalRule.selectors.map(sel => {
          return `#screen-${screen.id} ${sel}`;
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
    let style: HTMLStyleElement = null;

    for (let styleIndex = 0; styleIndex < allStyles.length; styleIndex++) {
      const styleInHeader = allStyles.item(styleIndex);

      if (styleInHeader.id === styleId) {
        style = styleInHeader;
        break;
      }
    }

    if (style == null) {
      style = document.createElement('style');
      style.id = styleId;
      style.type = 'text/css';
      head.appendChild(style);
    }

    if (style.childNodes.length > 0) {
      console.info('Rules in the Style', styleId);
      console.info('Childnodes', style.childNodes);

      style.childNodes.forEach(child => {
        console.info('Removing', child);
        style.removeChild(child);
      })
    }

    style.appendChild(document.createTextNode(customCss));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  toScreenClipCssAgain(screenClip: ScreenClip) {
    const obj = this.parseAndApplyClipCssRules(screenClip);

    return css.stringify(obj);
  }

  toScreenCssAgain(screen: Screen) {
    const obj = this.parseAndApplyScreenCssRules(screen);

    return css.stringify(obj);
  }
}
