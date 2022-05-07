import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AppQueries} from '../../../../../projects/app-state/src/lib/state/app.queries';
import {map, publishReplay, refCount, startWith} from 'rxjs/operators';
import {ActionType, CombinedActionContext, Screen} from '@memebox/contracts';
import {AppService} from '../../../../../projects/app-state/src/lib/state/app.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {combineLatest} from 'rxjs';
import {ScreenArrangePreviewComponent} from './screen-arrange-preview/screen-arrange-preview.component';
import {MatTabGroup} from '@angular/material/tabs';
import {MatTabChangeEvent} from '@angular/material/tabs/tab-group';
import {DialogService} from '../dialog.service';

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
    this.appQueries.actionMap$
  ]).pipe(
    map(([screen, clipMap]) => {
      const result: CombinedActionContext[] = [];

      for (const [key, entry] of Object.entries(screen.clips)) {
        const clip = clipMap[key];

        if (clip.type === ActionType.Audio) {
          continue;
        }

        result.push({
          screenMediaConfig: {
            ...entry
          },
          action: clip
        });
      }

      return result;
    }),
    publishReplay(),
    refCount()
  );

  selectedItems = new FormControl([]);
  selectedIndex = 0;

  unsavedChangesIds: string[] = [];

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

      return clipList.filter(clip => selectedItems.includes(clip.action.id));
    })
  );

  public currentSelectedClip: CombinedActionContext | null = null;

  @ViewChild(ScreenArrangePreviewComponent)
  private _screenArrangePreviewComponent: ScreenArrangePreviewComponent;

  @ViewChild(MatTabGroup)
  private _tabGroup: MatTabGroup;

  constructor(private appQueries: AppQueries,
              private appService: AppService,
              private _dialog: MatDialog,
              private _dlgService: DialogService,
              private _cd: ChangeDetectorRef,
              public dialogRef: MatDialogRef<ScreenArrangeComponent>,
              @Inject(MAT_DIALOG_DATA) public screen: Screen) {
  }

  ngOnInit(): void {
    this.appService.loadState();
  }

  closeDlg(): void {
    if (this.unsavedChangesIds.length === 0) {
      this.dialogRef.close();
      return;
    }
    this.clickedOutside();

    const dlgCloseMode = this._showDiscardDlg();

    dlgCloseMode.then(discardChanges => {
      if (discardChanges) {
        this.dialogRef.close();
      }
    });
  }

  tabSelectionChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.clickedOutside();
    if (this.unsavedChangesIds.length === 0 || tabChangeEvent.index === 0) {
      return;
    }

    this._tabGroup.selectedIndex = 0;
    this._cd.detectChanges();

    const dlgCloseMode = this._showDiscardDlg();

    dlgCloseMode.then(discardChanges => {
      if (discardChanges) {
        this._tabGroup.selectedIndex = 1;
        this.unsavedChangesIds = [];
        this.appService.loadState(); // Reset the clips
      }
    });
  }

  clickedOutside(): void {
    this._screenArrangePreviewComponent.clickedOutside();
  }

  userChangedMedia(clipId: string): void {
    const currentIds = this.unsavedChangesIds;
    if (!currentIds.includes(clipId)) {
      // create a new object for CD
      this.unsavedChangesIds = Array.from([...currentIds, clipId]);
    }
  }

  userResetChangedOfMedia(clipIds: string | string[]): void {
    const ids = Array.isArray(clipIds) ? clipIds : [clipIds];

    for (const clipId of ids) {
      const index = this.unsavedChangesIds.findIndex(id => id === clipId);
      const arrayCopy = Array.from(this.unsavedChangesIds);
      arrayCopy.splice(index, 1);
      this.unsavedChangesIds = arrayCopy;
    }

    // This is a workaround. Because the references seem to change, the sidebar selects another (the first) clip
    // if you want to keep the users selection, comment out the following line.
    this.clickedOutside();
  }

  private _showDiscardDlg(): Promise<boolean> {
    const dlgCloseMode = this._dlgService.showConfirmationDialog({
      title: 'Unsaved changes',
      content: 'You still have unsaved changes. If you leave this tab they will be reset to their prior state.',
      noButton: 'Keep',
      yesButton: 'Discard',
      overrideButtons: true
    });
    return dlgCloseMode;
  }

}
