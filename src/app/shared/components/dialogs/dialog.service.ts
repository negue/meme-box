import {Injectable, TemplateRef} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Clip, Screen, TimedClip, Twitch} from "@memebox/contracts";
import {ComponentType} from "@angular/cdk/portal";
import {MatDialogConfig} from "@angular/material/dialog/dialog-config";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {
  ConfirmationsPayload,
  SimpleConfirmationDialogComponent
} from "./simple-confirmation-dialog/simple-confirmation-dialog.component";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";
import {
  ScreenClipOptionsComponent,
  ScreenClipOptionsPayload
} from "./screen-clip-options/screen-clip-options.component";
import {TwitchEditComponent} from "./twitch-edit/twitch-edit.component";
import {
  ClipAssigningDialogComponent,
  ClipAssigningDialogOptions
} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {take} from "rxjs/operators";
import {TimedEditComponent} from "./timed-edit/timed-edit.component";
import {DynamicIframeContent} from "../../../../../projects/utils/src/lib/dynamicIframe";
import {DynamicIframeEditComponent} from "./dynamic-iframe-edit/dynamic-iframe-edit.component";
import {MarkdownComponent} from "./markdown/markdown.component";
import {HelpOverviewComponent} from "./help-overview/help-overview.component";
import {MarkdownDialogPayload} from "../../../../../server/constants";

@Injectable()
export class DialogService {

  constructor(
    private _dialog: MatDialog
  ) {

  }

  // any for now, until the confirmation dialog has its own enum
  showConfirmationDialog(payload: ConfirmationsPayload): Promise<boolean> {
    const dialogRef = this._dialog.open(SimpleConfirmationDialogComponent, {
      data: payload,
    });

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

  showDynamicIframeEdit(info: DynamicIframeContent) {
    return this._dialog.open(
      DynamicIframeEditComponent, {
        data: info,
        width: 'calc(min(1000px, 96%))',
        maxWidth: '96vw',
        minHeight: '50vh'
      }
    );
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

  showClipSelectionDialog(data: ClipAssigningDialogOptions) {
    return this.open(
      ClipAssigningDialogComponent, {
        data,
        width: '800px',

        panelClass: ['max-height-dialog', 'dialog-without-right-padding']
      }
    ).afterClosed().pipe(
      take(1),
    ).toPromise()
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

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return this._dialog.open(componentOrTemplateRef, config);
  }
}
