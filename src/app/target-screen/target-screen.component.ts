import * as css from 'css';
import {Rule} from 'css';
import {Component, ElementRef, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Clip, Dictionary, ScreenClip} from "@memebox/contracts";
import {distinctUntilChanged, filter, map, take, takeUntil} from "rxjs/operators";
import {AppQueries} from "../state/app.queries";
import {AppService} from "../state/app.service";
import {ActivatedRoute} from "@angular/router";
import {KeyValue} from "@angular/common";
import {WebsocketService} from "../core/services/websocket.service";
import {CombinedClip} from "./types";


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
          clip: allClips[key],
          backgroundColor: this.random_rgba()
        }
      }

      return result;
    })
  );
  mediaClipToShow$ = new BehaviorSubject<string>(null);
  clipToControlMap = new WeakMap<Clip, HTMLVideoElement | HTMLAudioElement | HTMLImageElement>();

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

    const thisScreenId = this.route.snapshot.params.guid;

    this.wsService.onOpenConnection$.pipe(
      take(1)
    ).subscribe(value => {
      this.wsService.sendI_Am_OBS(thisScreenId);
    })

    this.wsService.onUpdateData$.pipe(
      takeUntil(this._destroy$),
    ).subscribe(value => {
      this.appService.loadState();
    });

    this.wsService.onTriggerClip$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(clip => {
      if (clip.targetScreen === thisScreenId) {
        console.error('YES TRIGGERING IT', {clip});

        this.mediaClipToShow$.next(clip.id);
      }
    });

    this.wsService.onReloadScreen$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      location.reload();
    });

    this.screenId$.next(this.route.snapshot.params.guid);

    this.mediaClipMap$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(mediaClipMap => {
      for(const screenClipSettings of Object.values(mediaClipMap)){
        const customCss = screenClipSettings.clipSetting.customCss
          ? this.toCssAgain(screenClipSettings.clipSetting)
          : '';

        this.addOrUpdateStyleTag(screenClipSettings.clipSetting.id, customCss);
      }
    });

    this.screen$.pipe(
      takeUntil(this._destroy$),
      filter(screen => !!screen)
    ).subscribe(screen => {
      this.addOrUpdateStyleTag(screen.id, screen.customCss);
    });
  }

  addLog(load: string, $event: Event) {
    console.info({load, $event});

    this.log.push({
      load,
      $event,
      time: new Date()
    });
  }

  addToMap(value: Clip, element: any) {
    this.clipToControlMap.set(value, element);
  }

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',0.34)';
  }

  parseCss(screenClip: ScreenClip) {

    var obj = css.parse(screenClip.customCss, {
      silent: true
    });
    // css.stringify(obj, options);

    obj.stylesheet.rules.forEach(rule => {
      if (rule.type === 'rule') {
        const normalRule = rule as Rule;

        normalRule.selectors = normalRule.selectors.map(sel => {
          const withSpace = !sel.includes('.clip-holder');

          return `.${screenClip.id}${withSpace ? ' ': ''}${sel}`;
        });
      }
    })

    return obj;
  }

  addOrUpdateStyleTag(styleId: string, customCss: string) {
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

  toCssAgain(screenClip: ScreenClip) {
    const obj = this.parseCss(screenClip);

    return css.stringify(obj);
  }
}
