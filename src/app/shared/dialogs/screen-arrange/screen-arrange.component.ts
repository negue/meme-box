import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AppQueries } from '../../../state/app.queries';
import { map, publishReplay, refCount, startWith } from 'rxjs/operators';
import { CombinedClip, MediaType, PositionEnum, Screen } from '@memebox/contracts';
import { AppService } from '../../../state/app.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { AutoScaleComponent } from '@gewd/components/auto-scale';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ScreenArrangePreviewComponent } from './screen-arrange-preview/screen-arrange-preview.component';

@Component({
  selector: 'app-screen-clip-config',
  templateUrl: './screen-arrange.component.html',
  styleUrls: ['./screen-arrange.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenArrangeComponent implements OnInit {

  MediaType = MediaType;
  PositionEnum = PositionEnum;

  screen$ = this.appQueries.screenMap$.pipe(
    map(screenMap => screenMap[this.screen.id])
  );

  clipList$ = combineLatest([
    this.screen$,
    this.appQueries.clipMap$
  ]).pipe(
    map(([screen, clipMap]) => {
      const result: CombinedClip[] = [];

      for (const [key, entry] of Object.entries(screen.clips)) {
        const clip = clipMap[key];

        if (clip.type === MediaType.Audio ) {
          continue;
        }

        result.push({
          clipSetting: {
            ...entry
          },
          clip
        });
      }

      return result;
    }),
    publishReplay(),
    refCount()
  );

  selectedItems = new FormControl([]);

  public visibleItems$ = combineLatest([
    this.clipList$,
    this.selectedItems.valueChanges.pipe(
      startWith([])
    )
  ]).pipe(
    map(([clipList, selectedItems]) => {
      if (selectedItems.length === 0) {
        return clipList;
      }

      return clipList.filter(clip => selectedItems.includes(clip.clip.id));
    })
  )

  public currentSelectedClip: CombinedClip | null = null;

  @ViewChild(ScreenArrangePreviewComponent)
  private _screenArrangePreviewComponent: ScreenArrangePreviewComponent;

  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private cd: ChangeDetectorRef,
              private wsService: WebsocketService,
              @Inject(MAT_DIALOG_DATA) public screen: Screen) {
  }

  ngOnInit(): void {
    this.appService.loadState();
  }

  changed($event: Event, pair: CombinedClip) {
    console.info($event, pair);

    const newLeft = ($event.target as HTMLElement).style.getPropertyValue('--left');

    console.info('NEW LEFT', newLeft);
  }

  clickedOutside() {
    this._screenArrangePreviewComponent.clickedOutside();
  }

  saveScreenClip() {
    this.appService.addOrUpdateScreenClip(this.screen.id, this.currentSelectedClip.clipSetting);
  }

  resizeScaling(scaleContent: AutoScaleComponent, parentElement: HTMLDivElement) {
    scaleContent.width = parentElement.clientWidth;
    scaleContent.height = parentElement.clientHeight;

    console.info('resize called');
  }

  onPreview(visibleItem: CombinedClip) {
    this.wsService.onTriggerClip$.next({
      id: visibleItem.clip.id,
      targetScreen: this.screen.id
    });
  }

}
