import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Clip, Dictionary, ScreenClip} from "@memebox/contracts";
import {distinctUntilChanged, filter, map, pairwise, take, takeUntil, withLatestFrom} from "rxjs/operators";
import {AppQueries} from "../state/app.queries";
import {AppService} from "../state/app.service";
import {ActivatedRoute} from "@angular/router";
import {KeyValue} from "@angular/common";
import {WebsocketService} from "../core/services/websocket.service";

interface CombinedClip {
  clip: Clip;
  clipSetting: ScreenClip;
  backgroundColor: string;
}

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

    this.screenId$.next(this.route.snapshot.params.guid);

    // TODO Fix , multiple triggers of clips..
    // Only one clip can shown at once
    // if a 2nd one is added, it can hide the first one ...

    this.mediaClipToShow$.pipe(
      filter(clip => !!clip),
      withLatestFrom(this.mediaClipMap$),
      takeUntil(this._destroy$)
    ).subscribe(([clipIdToPlay, mediaClipMap]) => {
      const mediaInformation = mediaClipMap[clipIdToPlay];

      const control = this.clipToControlMap.get(mediaInformation.clip);

      if (control instanceof HTMLAudioElement
        || control instanceof HTMLVideoElement) {
        control.currentTime = 0;
        control.play();
        console.info('play', control.readyState);
      }

      if (mediaInformation.clip.playLength) {
        setTimeout(() => {
          this.mediaClipToShow$.next(null);
        }, mediaInformation.clip.playLength)
      }
    });

    this.mediaClipToShow$.pipe(
      pairwise(),
      withLatestFrom(this.mediaClipMap$),
      takeUntil(this._destroy$)
    ).subscribe(([[prev, current], mediaClipMap]) => {
      if (prev) {
        const mediaInformation = mediaClipMap[prev];

        const control = this.clipToControlMap.get(mediaInformation.clip);

        if (control instanceof HTMLMediaElement) {
          control.pause();
          control.currentTime = 0;
        }
      }
    })
  }

  addLog(load: string, $event: Event) {
    console.info({load, $event});

    this.log.push({
      load,
      $event,
      time: new Date()
    });
  }

  shouldPlay$(key: string) {
    return this.mediaClipToShow$.pipe(
      filter(mediaToShow => mediaToShow === key)
    )
  }

  addToMap(value: Clip, element: any) {
    this.clipToControlMap.set(value, element);
  }

  hideIfStillPlaying(entry: KeyValue<string, CombinedClip>) {
    const currentlyPlaying = this.mediaClipToShow$.value;

    if (currentlyPlaying == entry.key) {
      this.mediaClipToShow$.next(null);
    }
  }

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',0.34)';
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
