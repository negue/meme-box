import {Component, Input, OnInit, Output} from '@angular/core';
import {combineLatest, from, Subject} from "rxjs";
import {FormControl} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {ENDPOINTS, ObsSourceEntry} from "@memebox/contracts";
import {Scene} from "obs-websocket-js";
import {MemeboxApiService} from "@memebox/app-state";

@Component({
  selector: 'app-obs-source-selection',
  templateUrl: './obs-source-selection.component.html',
  styleUrls: ['./obs-source-selection.component.scss']
})
export class ObsSourceSelectionComponent implements OnInit {
  private _destroy$ = new Subject<void>();

  public sourceFormControl = new FormControl();

  @Output()
  public readonly payloadChanged = new Subject<string>();

  @Input()
  public payload: string|null = null;

  public allSourceListAsync = this.memeboxApi.get<ObsSourceEntry[]>(
    `${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SOURCE_LIST}`
  );

  public allSceneListAsync = this.memeboxApi.get<Scene[]>(
    `${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SCENE_LIST}`
  );


  public filteredSourceList$ = combineLatest([
    this.sourceFormControl.valueChanges.pipe(
      startWith(''),
    ),
    from(this.allSourceListAsync),
    from(this.allSceneListAsync)
  ]).pipe(
    map(([enteredText, allSources, allScenes]) => {
      const completeList = [
        ...(allSources?.map(s => s.name) ?? []),
        ...(allScenes?.map(s => s.name) ?? [])
      ];

      if (!enteredText) {
        return completeList;
      }

      enteredText = enteredText.toLowerCase();

      return completeList?.filter(s => s.toLowerCase().includes(enteredText));
    })
  );

  constructor(
    private memeboxApi: MemeboxApiService,
  ) {
    // Load State once

  }

  ngOnInit(): void {
    if (this.payload) {
      this.sourceFormControl.patchValue(this.payload);

      setTimeout(() => {
        if (this.payload) {
          this.payloadChanged.next(this.payload);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
