import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../../dialogs/dialog.service";
import {Observable} from "rxjs";
import {AppQueries} from "../../../../state/app.queries";
import {map} from "rxjs/operators";

interface ConnectionEntry {
  isConfigured: boolean;
  connectedAccount: string;
  hasAuthToken: boolean;
  openConfig: () => void;
}

// TODO:
// - twitch oauth window something
// - improve the Dialogs & settings for twitch

@Component({
  selector: 'app-connections-list',
  templateUrl: './connections-list.component.html',
  styleUrls: ['./connections-list.component.scss'],
  providers: [
    // TRANSLOCO_TWITCH_SCOPE,

    // even though it is registered in the root module you still need to use it here
    // in order to have the scope added to the component... because "reasons"
    // TRANSLOCO_CONFIG_SCOPE
  ]
})
export class ConnectionsListComponent implements OnInit {
  public config$ = this.appQuery.config$;


  groupedConnections$: Observable<Record<string, ConnectionEntry[]>> =  this.config$.pipe(
    map(config => {
      return {
        'Twitch':  [
          {
            isConfigured: !!config.twitch.channel,
            connectedAccount: 'Main: ' + config.twitch.channel,
            hasAuthToken: false,
            openConfig: () => this.dialogService.openTwitchConnectionConfig()
          },
          {
            isConfigured: !!config.twitch.bot?.auth?.name,
            connectedAccount: 'Bot: '+config.twitch.bot?.auth?.name,
            hasAuthToken: !!config.twitch.bot?.auth?.name,
            openConfig: () => this.dialogService.openTwitchConnectionConfig()
          }
        ],
       /* 'Streamelements':  [
          {
            isConfigured: false,
            connectedAccount: 'theChannelName',
            hasAuthToken: false,
            openConfig: () => this.dialogService.openMainTwitchConnection()
          },
        ],
       */ 'OBS':  [
          {
            isConfigured: false,
            connectedAccount: config.obs?.hostname,
            hasAuthToken: !!config.obs?.password,
            openConfig: () => this.dialogService.openObsConnectionDialog()
          },
        ]
      };
    })
  );

  originalOrder = (a: unknown, b: unknown): number => {
    return 0;
  }

  constructor(private dialogService: DialogService,
              private appQuery: AppQueries,
              ) { }

  ngOnInit(): void {
  }

}
