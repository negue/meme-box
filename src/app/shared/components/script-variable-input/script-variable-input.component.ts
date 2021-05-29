import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ScriptVariableTypes} from "@memebox/utils";
import {DialogService} from "../../dialogs/dialog.service";
import {ClipAssigningMode, UnassignedFilterEnum} from "@memebox/contracts";
import {BehaviorSubject, combineLatest} from "rxjs";
import {AppQueries} from "../../../state/app.queries";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-script-variable-input',
  templateUrl: './script-variable-input.component.html',
  styleUrls: ['./script-variable-input.component.scss']
})
export class ScriptVariableInputComponent implements OnInit, OnChanges {

  @Input()
  public variableType: ScriptVariableTypes;

  @Input()
  public label: string;

  @Input()
  public value: any;

  @Output()
  public valueChanged = new EventEmitter<any>();

  @Input()
  inConfigMode = false;

  public visibleMediaIdList$ = new BehaviorSubject<string[]>([]);

  public visibleMedia$ = combineLatest([
    this.visibleMediaIdList$,
    this.appQueries.clipMap$
  ]).pipe(
    map(([mediaIdList, mediaMap]) => {
      return mediaIdList.map(id => mediaMap[id])
    })
  );

  constructor(
    private dialogService: DialogService,
    private appQueries: AppQueries
  ) { }

  ngOnInit(): void {
    if (this.variableType === "media" && this.value ) {
      console.info('nginit', this.value);

      this.visibleMediaIdList$.next([this.value]);
    }
  }

  ngOnChanges({ value }: SimpleChanges): void {
    console.info({value});
    if (this.variableType === "media" && value && value.currentValue) {
      console.info('ngOnChanges', value.currentValue);

      this.visibleMediaIdList$.next([value.currentValue]);
    }
  }

  async selectSingleMedia() {
    const clipId = await this.dialogService.showClipSelectionDialog({
      mode: ClipAssigningMode.Single,
      selectedItemId: this.visibleMediaIdList$.value[0] ?? null,
      dialogTitle: 'Media Variable',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.Twitch,
      showOnlyUnassignedFilter: true
    });

    if (clipId) {
      console.info({clipId});

      this.visibleMediaIdList$.next([clipId]);
      this.value = clipId;
      this.valueChanged.next(clipId);
    }
  }

  // TODO Multi Selection
  async selectMultipleMedia() {
/*    const clipId = await this.dialogService.showClipSelectionDialog({
      mode: ClipAssigningMode.Single,
      selectedItemId: this.visibleMediaIdList$.value[0] ?? null,
      dialogTitle: 'Media Variable',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.Twitch,
      showOnlyUnassignedFilter: true
    });

    if (clipId) {
      console.info({clipId});

      this.visibleMediaIdList$.next([clipId]);
      this.value = clipId;
      this.valueChanged.next(clipId);
    }
*/
  }

}
