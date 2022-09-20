import {Compiler, Injectable, Injector, TemplateRef, Type} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Action, Screen, TimedAction, TwitchTrigger} from "@memebox/contracts";
import {ComponentType} from "@angular/cdk/portal";
import {MatDialogConfig} from "@angular/material/dialog/dialog-config";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import type {ConfirmationsPayload} from "./simple-confirmation-dialog/simple-confirmation-dialog.component";
import type {ScreenClipOptionsPayload} from "./screen-clip-options/screen-clip-options.component";
import type {ActionAssigningDialogOptions} from "./action-assigning-dialog/action-assigning-dialog.component";
import {MarkdownDialogPayload} from "../../../../server/constants";
import {
  CustomHtmlDialogPayload,
  CustomScriptDialogPayload,
  DialogContract,
  TwitchScopeSelectionPayload,
  TwitchScopeSelectionResult
} from "./dialog.contract";
import {MediaEditDialogPayload} from "./media-edit/media-edit.component";
import {DialogsModule} from "./dialogs.module";

// TODO rename async methods - maybe as eslint rule?

@Injectable({
  providedIn: DialogsModule
})
export class DialogService {

  constructor(
    private _dialog: MatDialog,
    private compiler: Compiler,
    private injector: Injector
  ) {

  }

  async showConfirmationDialog(payload: ConfirmationsPayload): Promise<boolean> {
    const dialogRef = await this.loadAndOpen(
      import('./simple-confirmation-dialog/simple-confirmation.dialog.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }

  showMediaEditDialog(clipInfo: MediaEditDialogPayload): void  {
    this.loadAndOpen(
      import('./media-edit/media-edit.module'),
      clipInfo
    )
  }

  showScreenEditDialog(screen: Partial<Screen>): void  {
    this.loadAndOpen(
      import('./screen-edit/screen-edit.module'),
      screen
    )
  }

  showScreenClipOptionsDialog(payload: ScreenClipOptionsPayload): void  {
    this.loadAndOpen(
      import('./screen-clip-options/screen-clip-options.module'),
      payload
    )
  }

  showTwitchEditDialog(info: TwitchTrigger): void  {
    this.loadAndOpen(
      import('./twitch-edit/twitch-edit.module'),
      info
    );
  }

  showGettingStarted(info: any): void  {
    this.loadAndOpen(
      import('./getting-started/getting-started-dialog.module'),
      info
    );
  }

  async showWidgetEdit(payload: CustomHtmlDialogPayload) {
    const dialogRef = await this.loadAndOpen(
      import('./widget-edit/widget-edit.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }


  async showScriptEdit(payload: CustomScriptDialogPayload) {
    const dialogRef = await this.loadAndOpen(
      import('./script-edit/script-edit.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }


  async showTriggerActionVariables(payload: Action) {
    const dialogRef = await this.loadAndOpen(
      import('./trigger-action-variables/trigger-action-variables-dialog.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }

  showTimedEditDialog(info: Partial<TimedAction>): void  {
    this.loadAndOpen(
      import('./timed-edit/timed-edit.module'),
      info
    );
  }

  async showActionSelectionDialogAsync(payload: ActionAssigningDialogOptions): Promise<string[]> {
    const dialogRef = await this.loadAndOpen(
      import('./action-assigning-dialog/action-assigning-dialog.module'),
      payload
    );

    const componentInstance = dialogRef.componentInstance;

    const dialogResult = await dialogRef.afterClosed().toPromise();

    if (!dialogResult) {
      return [];
    }

    const filteredActions = Object.entries(componentInstance.checkedMap)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    return filteredActions;
  }

  showHelpOverview(): void  {
    this.loadAndOpen(
      import('./help-overview/helpoverview-dialog.module'),
      null
    );
  }

  showMarkdownFile(info: MarkdownDialogPayload): void  {
    this.loadAndOpen(
      import('./markdown/markdown-dialog.module'),
      info
    );
  }

  arrangeMediaInScreen(info: Screen): void  {
    this.loadAndOpen(
      import('./screen-arrange/screen-arrange.module'),
      info
    );
  }

  async openTwitchScopeSelection(scopePayload: TwitchScopeSelectionPayload): Promise<TwitchScopeSelectionResult> {
    const dialogRef = await this.loadAndOpen(
      import('./twitch-scope-selection/twitch-scope-selection-dialog.module'),
      scopePayload
    );

    return await dialogRef.afterClosed().toPromise();
  }

  openTwitchConnectionConfig(): void  {
    this.loadAndOpen(
      import('./twitch-connection-edit/twitch-connection-edit.module'),
      null
    );
  }

  openObsConnectionDialog(): void  {
    this.loadAndOpen(
      import('./obs-connection-edit/obs-connection-edit.module'),
      null
    );
  }

  async loadAndOpen<TPayload, TDialogComponent>(
    // typesafety for module lazy loads :), it has to use the same TPayload you pass
    lazyDialogImport: Promise<{[moduleExport: string]: Type<DialogContract<TPayload, TDialogComponent>>}>,
    payload: TPayload
  ): Promise<MatDialogRef<TDialogComponent>> {
    const imported = await lazyDialogImport;
    const keys = Object.keys(imported);

    // get the first object of the imported js-module
    const theModule = imported[keys[0]];
    const factory = await this.compiler.compileModuleAsync(theModule);

    const factoryInstance = factory.create(this.injector);

    return factoryInstance.instance.openDialog(payload);
  }

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return this._dialog.open(componentOrTemplateRef, config);
  }

}
