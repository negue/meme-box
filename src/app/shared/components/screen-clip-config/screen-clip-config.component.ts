import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TrackByFunction} from '@angular/core';
import {AppQueries} from "../../../state/app.queries";
import {map, publishReplay, refCount, startWith} from "rxjs/operators";
import {ANIMATION_IN_ARRAY, ANIMATION_OUT_ARRAY, Clip, CombinedClip, MediaType, Screen} from "@memebox/contracts";
import {replaceholder} from "../../../core/pipes/replaceholder.pipe";
import {AppService} from "../../../state/app.service";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DragResizeMediaComponent} from "./drag-resize-media/drag-resize-media.component";
import {FormControl} from "@angular/forms";
import {combineLatest} from "rxjs";
import {AutoScaleComponent} from "@gewd/components/auto-scale";
import {WebsocketService} from "../../../core/services/websocket.service";
import {
  ClipAssigningMode,
  UnassignedFilterEnum
} from "../dialogs/clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {DialogService} from "../dialogs/dialog.service";
import {MatRipple} from "@angular/material/core";

@Component({
  selector: 'app-screen-clip-config',
  templateUrl: './screen-clip-config.component.html',
  styleUrls: ['./screen-clip-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenClipConfigComponent implements OnInit {

  MediaType = MediaType;

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
          clip: {
            ...clip,
            path: replaceholder(clipMap?.[key]?.path)
          }
        });
      }

      return result;
    }),
    publishReplay(),
    refCount()
  );

  public trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

  selectedItems = new FormControl([]);

  items: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

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

  public animateInList = ANIMATION_IN_ARRAY;

  public animateOutList = ANIMATION_OUT_ARRAY;

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

  onSelectMedia(mouseEvent: MouseEvent, matRippleInstance: MatRipple, $event: CombinedClip) {
    this.currentSelectedClip = $event;

    matRippleInstance.launch(mouseEvent.x, mouseEvent.y);
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

  assignMedia() {
    this.showAssignmentDialog(this.screen);
  }

  showAssignmentDialog(screen: Partial<Screen>) {
    this.dialogs.showClipSelectionDialog({
      mode: ClipAssigningMode.Multiple,
      screenId: screen.id,

      dialogTitle: screen.name,
      showMetaItems: false,
      showOnlyUnassignedFilter: true,
      unassignedFilterType: UnassignedFilterEnum.Screens
    });
  }

  openMediaSettingsDialog($event: MouseEvent, visibleItem: CombinedClip) {
    $event.stopImmediatePropagation();
    $event.stopPropagation();

    this.dialogs.showScreenClipOptionsDialog({
      clipId: visibleItem.clip.id,
      screenId: this.screen.id,
      name: visibleItem.clip.name
    });
  }
}
