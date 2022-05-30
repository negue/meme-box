import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MemeboxApiService } from "@memebox/app-state";
import { ENDPOINTS } from "@memebox/contracts";
import type { Scene } from "obs-websocket-js";
import { FormControl } from "@angular/forms";
import { combineLatest, from } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: 'app-obs-scene-selection',
  templateUrl: './obs-scene-selection.component.html',
  styleUrls: ['./obs-scene-selection.component.scss']
})
export class ObsSceneSelectionComponent implements OnInit {
  public sceneFormControl = new FormControl();


  @Input()
  public selectedScene = '';

  @Output()
  public readonly sceneSelected = new EventEmitter<string>();

  public allSceneListAsync = this.memeboxApi.get<Scene[]>(`${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.SCENE_LIST}`);

  public filteredSceneList$ = combineLatest([
    this.sceneFormControl.valueChanges.pipe(
      startWith(''),
    ),
    from(this.allSceneListAsync)
  ]).pipe(
    map(([enteredText, allScenes]) => {
      if (!enteredText) {
        return allScenes;
      }

      enteredText = enteredText.toLowerCase();

      return allScenes?.filter(s => s.name.toLowerCase().includes(enteredText));
    })
  );

  constructor(
    private memeboxApi: MemeboxApiService,
  ) {
    // Load State once

  }

  ngOnInit(): void {
    this.sceneFormControl.patchValue(this.selectedScene);
  }

}
