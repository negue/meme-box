import {Compiler, Injectable, Injector, TemplateRef} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Clip, Screen, TimedClip, Twitch} from "@memebox/contracts";
import {ComponentType} from "@angular/cdk/portal";
import {MatDialogConfig} from "@angular/material/dialog/dialog-config";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import type {ConfirmationsPayload} from "./simple-confirmation-dialog/simple-confirmation-dialog.component";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";
import {
  ScreenClipOptionsComponent,
  ScreenClipOptionsPayload
} from "./screen-clip-options/screen-clip-options.component";
import {TwitchEditComponent} from "./twitch-edit/twitch-edit.component";
import type {ClipAssigningDialogOptions} from "./clip-assigning-dialog/clip-assigning-dialog.component";
import {TimedEditComponent} from "./timed-edit/timed-edit.component";
import {DynamicIframeContent} from "../../../../../projects/utils/src/lib/dynamicIframe";
import {MarkdownComponent} from "./markdown/markdown.component";
import {HelpOverviewComponent} from "./help-overview/help-overview.component";
import {MarkdownDialogPayload} from "../../../../../server/constants";
import {ScreenClipConfigComponent} from "../screen-clip-config/screen-clip-config.component";
import {DialogContract} from "./dialog.contract";

@Injectable()
export class DialogService {

  constructor(
    private _dialog: MatDialog,
    private compiler: Compiler,
    private injector: Injector
  ) {

  }

  // any for now, until the confirmation dialog has its own enum
  async showConfirmationDialog(payload: ConfirmationsPayload): Promise<boolean> {
    const dialogRef = await this.loadAndOpen(
      import('./simple-confirmation-dialog/simple-confirmation.dialog.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }


  showMediaEditDialog(clipInfo: Partial<Clip>) {
    this._dialog.open(
      MediaEditComponent, {
        data: clipInfo,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw'
      }
    )
  }

  showScreenEditDialog(screen: Partial<Screen>) {
    this._dialog.open(
      ScreenEditComponent, {
        data: screen,
        width: '60%'
      }
    )
  }

  showScreenClipOptionsDialog(payload: ScreenClipOptionsPayload) {
    this._dialog.open(
      ScreenClipOptionsComponent, {
        data: payload,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw'
      }
    )
  }

  showTwitchEditDialog(info: Partial<Twitch>) {
    this._dialog.open(
      TwitchEditComponent, {
        data: info,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw',
        minHeight: '50vh'
      }
    )
  }

  async showDynamicIframeEdit(payload: DynamicIframeContent) {
    const dialogRef = await this.loadAndOpen(
      import('./dynamic-iframe-edit/dynamic-iframe-edit.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }

  showTimedEditDialog(info: Partial<TimedClip>) {
    this._dialog.open(
      TimedEditComponent, {
        data: info,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw',
        minHeight: '50vh'
      }
    )
  }

  async showClipSelectionDialog(payload: ClipAssigningDialogOptions) {
    const dialogRef = await this.loadAndOpen(
      import('./clip-assigning-dialog/clip-assigning-dialog.module'),
      payload
    );

    return dialogRef.afterClosed().toPromise();
  }

  showHelpOverview() {
    this._dialog.open(
      HelpOverviewComponent, {
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw',
        minHeight: '50vh'
      }
    )
  }

  showMarkdownFile(info: MarkdownDialogPayload) {
    this._dialog.open(
      MarkdownComponent, {
        autoFocus: false,
        data: info,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw',
        minHeight: '50vh'
      }
    )
  }


  arrangeMediaInScreen(info: Screen) {
    this._dialog.open(
      ScreenClipConfigComponent, {
        autoFocus: false,
        data: info,
        minWidth: '100vw',
        maxWidth: '100vw',
        minHeight: '100vh',
        maxHeight: '100vh',
        panelClass: 'fullscreen-dialog'
      }
    )
  }

  async loadAndOpen<TPayload, TDialogModule extends DialogContract<TPayload>>(
    lazyDialogImport: Promise<any>, payload: TPayload
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
