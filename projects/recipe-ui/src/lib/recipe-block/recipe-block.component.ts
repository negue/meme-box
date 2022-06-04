import {ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import {RecipeEntry, RecipeEntryCommandCall, RecipeSubCommandInfo} from "@memebox/recipe-core";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {RecipeContextDirective} from "../recipe-context.directive";
import {DialogService} from "../../../../../src/app/shared/dialogs/dialog.service";
import {RecipeCommandSelectorComponent} from "../recipe-command-selector/recipe-command-selector.component";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {RecipeCommandCreatorService} from "../recipe-command-creator.service";

@Component({
  selector: 'app-recipe-block',
  templateUrl: './recipe-block.component.html',
  styleUrls: ['./recipe-block.component.scss']
})
export class RecipeBlockComponent
  implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  @Input()
  public entry!: RecipeEntry;

  @Input()
  public parent!: RecipeEntry;

  @Input()
  @HostBinding('class.block')
  public asBlock = false;

  @Input()
  public isRoot = false;

  @Input()
  public editMode = false;

  constructor(
    public context: RecipeContextDirective,
    private stepCreator: RecipeCommandCreatorService,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.isRoot) {
      this.context.recipeUpdated.pipe(
        takeUntil(this._destroy$)
      ).subscribe(value => {
        console.info('setting the entry', value);
        this.entry = value;
        this.cd.markForCheck();
      });
    }
  }


  stepRearranged ($event: CdkDragDrop<unknown, unknown>,
                  subStepInfo: RecipeSubCommandInfo): void  {
    const newPos = $event.currentIndex;
    const oldPos = $event.previousIndex;

    this.context.moveStep(
      oldPos, newPos,
      this.entry, subStepInfo.labelId
    );
  }

  removeStep (subStep: RecipeEntry, parent: RecipeEntry): void  {
    this.context.removeStep(
      subStep,
      parent
    );
  }

  async addStep (entry: RecipeEntry, subStepInfo: RecipeSubCommandInfo) {
    const result = this.dialogService.open(RecipeCommandSelectorComponent, {
      data: {
        entry,
        subStepInfo,
        context: this.context.recipe
      },
      autoFocus: false
    });

    const dialogResult: RecipeEntryCommandCall = await result.afterClosed().toPromise();

    if (dialogResult) {
      this.context.addStep(entry, subStepInfo, dialogResult)
    }
  }

  toggleAwaited (entry: RecipeEntry): void  {
    this.context.changeAwaited(entry, !entry.awaited);
  }

  ngOnDestroy (): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async editStepConfig(entry: RecipeEntry, parent: RecipeEntry) {
    if (entry.entryType !== 'command') {
      return;
    }

    const newPayload = await this.stepCreator.editStepData(entry, this.context.recipe!);

    if (newPayload) {
      this.context.changePayload(entry, newPayload);
    }
  }
}
