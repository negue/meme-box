import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TwitchScopeSelectionPayload} from "../dialog.contract";

const defaultScopes = [
  // 'user:read:email',            // ???
  'chat:read',                     // TMI - Chat
  'chat:edit',                     // TMI - Write to chat?
  'channel:read:redemptions',      // PubSub Channelpoints Event
  'channel:manage:redemptions'     // Twitch API Change Channelpoint Redemptions
];


@Component({
  selector: 'app-twitch-scope-selection',
  templateUrl: './twitch-scope-selection.component.html',
  styleUrls: ['./twitch-scope-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwitchScopeSelectionComponent implements OnInit {

  defaultScopes = defaultScopes;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TwitchScopeSelectionPayload,
              private dialogRef: MatDialogRef<any>,
              private cd: ChangeDetectorRef) {

  }

  ngOnInit(): void {
  }


  addScope(): void {
    this.data.scopes.push('');
    this.cd.markForCheck();
  }

  deleteScope(index: number): void {
    this.data.scopes.splice(index, 1);
    this.cd.markForCheck();
  }

  chooseScopes() {
    this.dialogRef.close(this.data.scopes);
  }

  trackByIndex: TrackByFunction<any> = index => index;
}
