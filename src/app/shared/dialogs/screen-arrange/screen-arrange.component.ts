import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TrackByFunction } from '@angular/core';
import { AppQueries } from '../../../state/app.queries';
import { map, publishReplay, refCount, startWith, take } from 'rxjs/operators';
import { Clip, CombinedClip, MediaType, PositionEnum, Screen } from '@memebox/contracts';
import { AppService } from '../../../state/app.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragResizeMediaComponent } from './drag-resize-media/drag-resize-media.component';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { AutoScaleComponent } from '@gewd/components/auto-scale';
import { WebsocketService } from '../../../core/services/websocket.service';
import { DialogService } from '../dialog.service';

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

  public trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

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

  public currentSelectedClip: CombinedClip| null = null;
  private combinedClipToComponent = new WeakMap<CombinedClip, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent|null = null;


  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private cd: ChangeDetectorRef,
              private wsService: WebsocketService,
              private dialogs: DialogService,
              @Inject(MAT_DIALOG_DATA) public screen: Screen) { }

  ngOnInit(): void {
    this.appService.loadState();
  }

  changed($event: Event, pair: CombinedClip) {
    console.info($event, pair);

    const newLeft = ($event.target as HTMLElement).style.getPropertyValue('--left');

    console.info('NEW LEFT', newLeft);
  }

  elementClicked(dragResizeMediaComponent: DragResizeMediaComponent,
                 pair: CombinedClip) {
    this.resetTheResizeBorder();

    this.currentSelectedClip = pair;

    // todo select the item in the left list
    this.previouslyClickedComponent = dragResizeMediaComponent;
    dragResizeMediaComponent.showResizeBorder = true;

    console.warn('show resize border true');

    this.cd.markForCheck();
  }

  clickedOutside() {
    this.currentSelectedClip = null;
    this.resetTheResizeBorder();

    console.info('clicked outside');

    this.cd.markForCheck();
  }

  private resetTheResizeBorder () {
    if (this.previouslyClickedComponent != null) {
      this.previouslyClickedComponent.showResizeBorder = false;
    }
  }



  triggerChangedetection() {
    const component = this.combinedClipToComponent.get(this.currentSelectedClip);

    console.info('trigger cd', {
      component, clip: this.currentSelectedClip
    });

    if (component) {
      component.settings = this.currentSelectedClip.clipSetting;
      component.ngOnChanges({});
    }

    this.cd.detectChanges();

  }

  elementCreated(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedClip) {
    this.combinedClipToComponent.set(pair, dragResizeMediaComponent);
  }

  onCheckedToggle($event: MatCheckboxChange, warpingCheckbox: MatCheckbox) {
    if ($event.checked) {
      warpingCheckbox.checked = false;
    }
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

  reset() {
    const {clipSetting} = this.currentSelectedClip;

    clipSetting.transform = null;
    clipSetting.width = '50%';
    clipSetting.height = '50%';

    if (clipSetting.position === PositionEnum.Absolute) {
      clipSetting.top = '10%';
      clipSetting.left = '10%';
      clipSetting.right = null;
      clipSetting.bottom = null;
    }

    if (clipSetting.position === PositionEnum.Centered) {
      clipSetting.top = null;
      clipSetting.left = null;
    }

    this.appService.addOrUpdateScreenClip(this.screen.id, clipSetting);
  }

  async saveAllSettings() {
    const allVisibleItems = await this.visibleItems$.pipe(
      take(1)
    ).toPromise();

    for (const item of allVisibleItems) {
      // TODO replace with a bulk update
      await this.appService.addOrUpdateScreenClip(this.screen.id, item.clipSetting);
    }
  }
}
