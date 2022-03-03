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

  showMediaEditDialog(clipInfo: MediaEditDialogPayload) {
    this.loadAndOpen(
      import('./media-edit/media-edit.module'),
      clipInfo
    )
  }

  showScreenEditDialog(screen: Partial<Screen>) {
    this.loadAndOpen(
      import('./screen-edit/screen-edit.module'),
      screen
    )
  }

  showScreenClipOptionsDialog(payload: ScreenClipOptionsPayload) {
    this.loadAndOpen(
      import('./screen-clip-options/screen-clip-options.module'),
      payload
    )
  }

  showTwitchEditDialog(info: TwitchTrigger) {
    this.loadAndOpen(
      import('./twitch-edit/twitch-edit.module'),
      info
    );
  }

  showGettingStarted(info: any) {
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

  showTimedEditDialog(info: Partial<TimedAction>) {
    this.loadAndOpen(
      import('./timed-edit/timed-edit.module'),
      info
    );
  }

  async showClipSelectionDialog(payload: ActionAssigningDialogOptions) {
    const dialogRef = await this.loadAndOpen(
      import('./action-assigning-dialog/action-assigning-dialog.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }

  showHelpOverview() {
    this.loadAndOpen(
      import('./help-overview/helpoverview-dialog.module'),
      null
    );
  }

  showMarkdownFile(info: MarkdownDialogPayload) {
    this.loadAndOpen(
      import('./markdown/markdown-dialog.module'),
      info
    );
  }

  arrangeMediaInScreen(info: Screen) {
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

  openTwitchConnectionConfig() {
    this.loadAndOpen(
      import('./twitch-connection-edit/twitch-connection-edit.module'),
      null
    );
  }

  openObsConnectionDialog() {
    this.loadAndOpen(
      import('./obs-connection-edit/obs-connection-edit.module'),
      null
    );
  }

  async loadAndOpen<TPayload, TDialogModule extends DialogContract<TPayload>>(
    // typesafety for module lazy loads :), it has to use the same TPayload you pass
    lazyDialogImport: Promise<{[moduleExport: string]: Type<TDialogModule>}>,
    payload: TPayload
  ): Promise<MatDialogRef<any>> {
    const imported = await lazyDialogImport;
    const keys = Object.keys(imported);

    // get the first object of the imported js-module
    const theModule = imported[keys[0]];
    const factory = await this.compiler.compileModuleAsync<TDialogModule>(theModule);

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
