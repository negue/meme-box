import {Component, Input, OnInit} from '@angular/core';
import {Action, TwitchTrigger} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries, AppService} from "@memebox/app-state";
import {DialogService} from "../../../../shared/dialogs/dialog.service";

@Component({
  selector: 'app-action-shortcut-toolbar',
  templateUrl: './action-shortcut-toolbar.component.html',
  styleUrls: ['./action-shortcut-toolbar.component.scss']
})
export class ActionShortcutToolbarComponent implements OnInit {

  @Input()
  public action: Action;


  public twitchEvents$: Observable<TwitchTrigger[]> = this.appQueries.twitchEvents$.pipe(
    map(twitchEvents => twitchEvents.filter(twitchEvent => twitchEvent.clipId == this.action.id))
  );


  constructor(
    private service: AppService,
    private appQueries: AppQueries,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
  }

  onToggleMobileShow() {
    const newClip = {
      ...this.action,
      showOnMobile: !this.action.showOnMobile
    } as Action;

    this.service.addOrUpdateAction(newClip);
  }

  onToggleTwitchEvent(twitchId: string) {
    this.service.toggleTwitchActiveState(twitchId);
  }


  onlyWithOneEventPossible() {
    this.dialogService.showConfirmationDialog({
      title: 'Only Actions with one Twitch Event can be toggled',
      overrideButtons: true,
      noButton: 'OK'
    });
  }
}
