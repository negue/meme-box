import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TrackByFunction} from '@angular/core';
import {AppQueries} from "../../../state/app.queries";
import {map, publishReplay, refCount} from "rxjs/operators";
import {ANIMATION_IN_ARRAY, ANIMATION_OUT_ARRAY, Clip, CombinedClip, MediaType, Screen} from "@memebox/contracts";
import {replaceholder} from "../../../core/pipes/replaceholder.pipe";
import {AppService} from "../../../state/app.service";
import {MatSelectionList, MatSelectionListChange} from "@angular/material/list";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DragResizeMediaComponent} from "./drag-resize-media/drag-resize-media.component";

@Component({
  selector: 'app-screen-clip-config',
  templateUrl: './screen-clip-config.component.html',
  styleUrls: ['./screen-clip-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenClipConfigComponent implements OnInit {

  MediaType = MediaType;

  clipList$ = this.appQueries.clipMap$.pipe(
    map((clipMap) => {
      const result: CombinedClip[] = [];

      for (const [key, entry] of Object.entries(this.screen.clips)) {
        result.push({
          clipSetting: {
            ...entry
          },
          clip: {
            ...clipMap[key],
            path: replaceholder(clipMap?.[key]?.path)
          }
        });
      }

      return result;
    }),
    publishReplay(),
    refCount()
  )

  public trackByClip: TrackByFunction<Clip> = (index, item) => item.id;

  public animateInList = ANIMATION_IN_ARRAY;

  public animateOutList = ANIMATION_OUT_ARRAY;

  public currentSelectedClip: CombinedClip| null = null;
  private combinedClipToComponent = new WeakMap<CombinedClip, DragResizeMediaComponent>();

  private previouslyClickedComponent: DragResizeMediaComponent|null = null;


  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private cd: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public screen: Screen) { }

  ngOnInit(): void {
    this.appService.loadState();
  }

  changed($event: Event, pair: CombinedClip) {
    console.info($event, pair);

    const newLeft = ($event.target as HTMLElement).style.getPropertyValue('--left');

    console.info('NEW LEFT', newLeft);
  }

  elementClicked(dragResizeMediaComponent: DragResizeMediaComponent, pair: CombinedClip, mediaList: MatSelectionList) {
    this.resetTheResizeBorder();

    this.currentSelectedClip = pair;
    var listItemOfPair = mediaList.options.find(o => o.value === pair);

    mediaList.selectedOptions.select(listItemOfPair);

    // todo select the item in the left list
    this.previouslyClickedComponent = dragResizeMediaComponent;
    dragResizeMediaComponent.showResizeBorder = true;

    console.warn('show resize border true');

    this.cd.markForCheck();
  }

  clickedOutside() {
    this.resetTheResizeBorder();

    console.info('clicked outside');

    this.cd.markForCheck();
  }

  private resetTheResizeBorder () {
    if (this.previouslyClickedComponent != null) {
      this.previouslyClickedComponent.showResizeBorder = false;
    }
  }

  onSelectMedia($event: MatSelectionListChange) {
    this.currentSelectedClip = $event.options[0].value;
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
}
