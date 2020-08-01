import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {Clip, Dictionary, ScreenClip, TriggerClip} from "@memebox/contracts";
import {filter, map, pairwise, takeUntil, withLatestFrom} from "rxjs/operators";
import {AppQueries} from "../state/app.queries";
import {AppService} from "../state/app.service";
import {ActivatedRoute} from "@angular/router";
import {WS_PORT} from "../../../server/constants";
import {KeyValue} from "@angular/common";

interface CombinedClip {
  clip: Clip;
  clipSetting: ScreenClip;
}

@Component({
  selector: 'app-target-screen',
  templateUrl: './target-screen.component.html',
  styleUrls: ['./target-screen.component.scss']
})
export class TargetScreenComponent implements OnInit, OnDestroy {

  log = [];

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
          clip: allClips[key]
        }
      }

      return result;
    })
  );
  mediaClipToShow$ = new BehaviorSubject<string>(null);
  clipToControlMap = new  WeakMap<Clip, HTMLVideoElement|HTMLAudioElement|HTMLImageElement>();

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.appService.loadState();

    const thisScreenId = this.route.snapshot.params.guid;

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
    ws.onmessage = event => {
      console.debug("WebSocket message received:", event);

      const dataAsString = event.data as string;

      console.error({dataAsString});

      const [action, payload] = dataAsString.split('=');

      switch (action) {
        case 'TRIGGER_CLIP': {
          const payloadObj:TriggerClip = JSON.parse(payload);

          console.info('Received', payloadObj, thisScreenId);
          if (payloadObj.targetScreen === thisScreenId) {
            console.error('YES TRIGGERING IT', {payloadObj});

            this.mediaClipToShow$.next(payloadObj.id);
          }
          break;
        }
        case 'UPDATE_DATA': {
          this.appService.loadState();
        }
      }

    };
    ws.onopen = ev => {
      ws.send( `I_AM_OBS=${this.route.snapshot.params.guid}`);
    };
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

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
