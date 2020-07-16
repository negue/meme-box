import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Clip, Dictionary} from "@memebox/contracts";
import {filter, withLatestFrom} from "rxjs/operators";
import {AppQueries} from "../state/app.queries";
import {AppService} from "../state/app.service";
import {ActivatedRoute} from "@angular/router";
import {WS_PORT} from "../../../server/constants";

@Component({
  selector: 'app-obs-page',
  templateUrl: './obs-page.component.html',
  styleUrls: ['./obs-page.component.scss']
})
export class ObsPageComponent implements OnInit {

  log = [];

  mediaClipMap$: Observable<Dictionary<Clip>> = this.appQuery.clipMap$;
  mediaClipToShow$ = new BehaviorSubject<string>(null);
  clipToControlMap = new  WeakMap<Clip, HTMLVideoElement|HTMLAudioElement|HTMLImageElement>();

  constructor(private appQuery: AppQueries,
              private appService: AppService,
              private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.appService.loadState();

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
    ws.onmessage = event => {
      console.debug("WebSocket message received:", event);

      const dataAsString = event.data as string;

      if (dataAsString.includes('TRIGGER_CLIP')) {
        console.error({dataAsString});

        const [action, payload] = dataAsString.split('=');

        switch (action) {
          case 'TRIGGER_CLIP': {
            const payloadObj = JSON.parse(payload);

            console.error({payloadObj});


            this.mediaClipToShow$.next(payloadObj.id);
            break;
          }
          case 'UPDATE_DATA': {
            this.appService.loadState();
          }
        }
      }
    };
    ws.onopen = ev => {
      ws.send( `I_AM_OBS=${this.route.snapshot.params.guid}`);
    };

    this.mediaClipToShow$.pipe(
        withLatestFrom(this.mediaClipMap$)
    ).subscribe(([clipIdToPlay, mediaClipMap]) => {
      const mediaInformation = mediaClipMap[clipIdToPlay];

      const control = this.clipToControlMap.get(mediaInformation);

      if (control instanceof HTMLVideoElement) {
        control.play();
      }

      if (control instanceof HTMLAudioElement) {
        control.play();
      }
    })
  }

  showPicture() {
    this.mediaClipToShow$.next('pic1');
  }

  showAudio() {
    this.mediaClipToShow$.next('audio1');
  }

  showVideo() {
    this.mediaClipToShow$.next('video1');
  }

  addLog(load: string, $event: Event, video: HTMLVideoElement) {
    console.info({load, $event});

    this.log.push({
      load,
      $event,
      time: new Date()
    });

    if (load === 'loadeddata') {
     //  video.play();
    }
  }

  shouldPlay$(key: string) {
    return this.mediaClipToShow$.pipe(
      filter(mediaToShow => mediaToShow === key)
    )
  }

  addToMap(value: Clip, element: any) {
    this.clipToControlMap.set(value, element);
  }
}
