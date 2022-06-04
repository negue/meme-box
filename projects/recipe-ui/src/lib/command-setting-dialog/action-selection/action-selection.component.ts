import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  listAllEntriesOfTypes,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeContext
} from "@memebox/recipe-core";
import {BehaviorSubject, combineLatest} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import {filter, map, startWith, withLatestFrom} from "rxjs/operators";
import {isNonNull} from "@gewd/utils/ts";
import {ActionType, ClipAssigningMode, UnassignedFilterEnum} from "@memebox/contracts";
import {DialogService} from "../../../../../../src/app/shared/dialogs/dialog.service";

interface ActionIdName {
  id: string;
  name: string;
  type: ActionType;
}

const DEFAULT_ENTRY_IN_SELECTION = '____DEFAULT____';

@Component({
  selector: 'app-action-selection',
  templateUrl: './action-selection.component.html',
  styleUrls: ['./action-selection.component.scss']
})
export class ActionSelectionComponent implements OnInit {

  private readonly recipeContext$ = new BehaviorSubject<RecipeContext|null>(null);

  public selectionActionIdUi$ = new BehaviorSubject<string|null|undefined>(DEFAULT_ENTRY_IN_SELECTION);

  @Output()
  public readonly selectedActionId$ = new EventEmitter<string>();

  @Input()
  public set selectedActionId(value: string) {
    if (value) {
      this.selectionActionIdUi$.next(value);
    }
  }

  @Input()
  public set recipeContext(value: RecipeContext) {
    this.recipeContext$.next(value);
  }

  public readonly alreadyUsedActionList$ = this.recipeContext$.pipe(
    filter(isNonNull),
    withLatestFrom(this.appQuery.actionMap$),
    map(([recipeContext, actionMap]) => {
      const allFoundActions = new Set<string>();

      const iterator = listAllEntriesOfTypes(
        recipeContext, recipeContext.rootEntry, [
          'triggerAction', 'triggerActionWhile',
          'triggerRandom', 'updateActionProperties'
        ]
      );

      for (const foundCommand of iterator) {
        if (foundCommand.commandBlockType === 'triggerRandom') {
          const payload = foundCommand.payload['actions'] as RecipeCommandConfigActionListPayload;

          for (const recipeCommandConfigActionPayload of payload) {
            allFoundActions.add(recipeCommandConfigActionPayload.actionId);
          }

        } else {
          const payload = foundCommand.payload['action'] as RecipeCommandConfigActionPayload;

          if (payload) {
            allFoundActions.add(payload.actionId);
          }
        }
      }

      return new Array(...allFoundActions).map(value => {
        return {
          id: value,
          name: actionMap[value].name,
          type: actionMap[value].type
        } as ActionIdName
      })
    }),
    startWith([] as ActionIdName[])
  );

  public shouldSelectionListBeVisible$ = combineLatest([
    this.selectionActionIdUi$,
    this.alreadyUsedActionList$
  ]).pipe(
    map(([selectedAction, itemsInTheList]) => {
      if (selectedAction === DEFAULT_ENTRY_IN_SELECTION) {
        return true;
      }

      return itemsInTheList.map(i => i.id).includes(selectedAction ?? '');
    }),
    startWith(true)
  )

  public selectedActionInfo$ =     this.selectionActionIdUi$.pipe(
    withLatestFrom(this.appQuery.actionMap$),
    map(([actionId, actionMap]) => actionId ? actionMap[actionId] : null)
  );

  constructor(
    private appQuery: AppQueries,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
  }

  async onSelectionChanged(newActionId: string|null) {
    if (newActionId) {
      this.selectedActionId$.next(newActionId);
    } else {
      await this.selectActionFromDialog();
    }
  }

  async selectActionFromDialog() {
    const actionId = await this._selectAction(this.selectionActionIdUi$.value ?? '');

    if (actionId) {
      this.selectionActionIdUi$.next(actionId);
      this.selectedActionId$.next(actionId);
    }
  }


  private _selectAction (actionId?: string | undefined): Promise<string> {
    return this.dialogService.showActionSelectionDialogAsync({
      mode: ClipAssigningMode.Single,
      selectedItemId: actionId,
      dialogTitle: 'Config Argument',
      showMetaItems: true,

      unassignedFilterType: UnassignedFilterEnum.RecipeCommandArgument,
      // showOnlyUnassignedFilter: true
    });
  }

}