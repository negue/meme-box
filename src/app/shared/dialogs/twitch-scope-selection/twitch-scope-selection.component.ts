import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TwitchScopeSelectionPayload, TwitchScopeSelectionResult} from "../dialog.contract";
import {DEFAULT_TWITCH_SCOPES} from "@memebox/contracts";

@Component({
  selector: 'app-twitch-scope-selection',
  templateUrl: './twitch-scope-selection.component.html',
  styleUrls: ['./twitch-scope-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwitchScopeSelectionComponent {

  defaultScopes = DEFAULT_TWITCH_SCOPES;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TwitchScopeSelectionPayload,
              private dialogRef: MatDialogRef<any>,
              private cd: ChangeDetectorRef) {
    this.data = {
      ...this.data,
      scopes: [ // readonly from state, TODO some better way
        ...this.data.scopes
      ]
    };
  }

  addScope(): void {
    this.data.scopes.push('');
    this.cd.markForCheck();
  }

  deleteScope(index: number): void {
    this.data.scopes.splice(index, 1);
    this.cd.markForCheck();
  }

  chooseScopes(): void  {
    this.dialogRef.close({
      defaultScopes: DEFAULT_TWITCH_SCOPES,
       custom: this.data.scopes
    } as TwitchScopeSelectionResult);
  }

  trackByIndex: TrackByFunction<any> = index => index;
}
