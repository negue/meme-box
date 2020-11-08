import {Injectable, TemplateRef} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Clip, Screen, Twitch} from "@memebox/contracts";
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

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return this._dialog.open(componentOrTemplateRef, config);
  }
}
