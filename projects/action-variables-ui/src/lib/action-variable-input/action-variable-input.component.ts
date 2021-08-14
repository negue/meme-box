import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {ClipAssigningMode} from "@memebox/contracts";
import {BehaviorSubject, combineLatest} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import {map} from "rxjs/operators";
import {ActionVariableTypes} from "@memebox/action-variables";

@Component({
  selector: 'app-action-variable-input',
  templateUrl: './action-variable-input.component.html',
  styleUrls: ['./action-variable-input.component.scss']
})
export class ActionVariableInputComponent implements OnInit, OnChanges {

  @Input()
  public variableType: ActionVariableTypes;

  @Input()
  public label: string;

  @Input()
  public value: unknown;

  @Output()
  public valueChanged = new EventEmitter<unknown>();

  @Input()
  inConfigMode = false;

  public visibleActionIdList$ = new BehaviorSubject<string[]>([]);

  public visibleMedia$ = combineLatest([
    this.visibleActionIdList$,
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
    if (this.variableType === ActionVariableTypes.action
      && typeof this.value === 'string' ) {
      console.info('nginit', this.value);

      this.visibleActionIdList$.next([this.value]);
    }
  }

  ngOnChanges({ value }: SimpleChanges): void {
    console.info({value});
    if (this.variableType === ActionVariableTypes.action && value && value.currentValue) {
      console.info('ngOnChanges', value.currentValue);

      this.visibleActionIdList$.next([value.currentValue]);
    }
  }

  async selectSingleMedia() {
    const actionId = await this.dialogService.showClipSelectionDialog({
      mode: ClipAssigningMode.Single,
      selectedItemId: this.visibleActionIdList$.value[0] ?? null,
      dialogTitle: 'Action Variable',
      showMetaItems: true,

      showOnlyUnassignedFilter: true
    });

    if (actionId) {
      console.info({clipId: actionId});

      this.visibleActionIdList$.next([actionId]);
      this.value = actionId;
      this.valueChanged.next(actionId);
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
