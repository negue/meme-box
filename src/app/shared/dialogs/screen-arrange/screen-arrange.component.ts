import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AppQueries } from '../../../state/app.queries';
import { map, publishReplay, refCount, startWith } from 'rxjs/operators';
import { CombinedClip, MediaType, Screen } from '@memebox/contracts';
import { AppService } from '../../../state/app.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { ScreenArrangePreviewComponent } from './screen-arrange-preview/screen-arrange-preview.component';
import { MatTabGroup } from '@angular/material/tabs';
import { OpenChangesDlgComponent } from './open-changes-dlg.component';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';

@Component({
  selector: 'app-screen-clip-config',
  templateUrl: './screen-arrange.component.html',
  styleUrls: ['./screen-arrange.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenArrangeComponent implements OnInit {
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
  selectedIndex = 0;

  hasUnsavedChanges = false;

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

  @ViewChild(MatTabGroup)
  private _tabGroup: MatTabGroup;

  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private _dialog: MatDialog,
              private _cd: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public screen: Screen) {
  }

  ngOnInit(): void {
    this.appService.loadState();
  }

  tabSelectionChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.clickedOutside();
    if (!this.hasUnsavedChanges || tabChangeEvent.index === 0) {
      return;
    }

    this._tabGroup.selectedIndex = 0;
    this._cd.detectChanges();

    const dlg = this._dialog.open(OpenChangesDlgComponent, {
      width: '250px',
      closeOnNavigation: true,
      hasBackdrop: true
    });

    dlg.afterClosed().subscribe(discardChanges => {
      if (discardChanges) {
        this._tabGroup.selectedIndex = 1;
        this.hasUnsavedChanges = false;
      }
    });
  }

  clickedOutside() {
    this._screenArrangePreviewComponent.clickedOutside();
  }
}
