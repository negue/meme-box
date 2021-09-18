import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../../dialogs/dialog.service";
import {combineLatest, Observable} from "rxjs";
import {AppQueries, AppService} from "@memebox/app-state";
import {switchMap} from "rxjs/operators";
import {ConfigService} from "../../../../../../projects/app-state/src/lib/services/config.service";
import {readableSeconds} from "../../../../../../projects/ui-components/src/lib/pipes/utils";

interface ConnectionEntry {
  isConfigured: boolean;
  connectedAccount: string;
  hasAuthToken: boolean;
  isValid: boolean;
  validUntil?: string;
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


  groupedConnections$: Observable<Record<string, ConnectionEntry[]>> =
    combineLatest([
      this.config$,
      this.appService.isOffline$()
  ]).pipe(
    switchMap(async ([config, isOffline]) => {
      const authInformation = isOffline
        ? []
        : await this.configService.loadTwitchAuthInformations();

      const mainTwitchAuthInfo = authInformation?.find(a => a.type === 'main');
      const botTwitchAuthInfo = authInformation?.find(a => a.type === 'bot');

      return {
        'Twitch':  [
          {
            isConfigured: !!config.twitch.channel,
            connectedAccount: 'Main: ' + (mainTwitchAuthInfo?.authResult?.reason ??
               config.twitch.channel),
            hasAuthToken: !!config.twitch.token,
            isValid: mainTwitchAuthInfo?.authResult?.valid,
            validUntil: readableSeconds(mainTwitchAuthInfo?.authResult?.expires_in).string,
            openConfig: () => this.dialogService.openTwitchConnectionConfig()
          },
          {
            isConfigured: !!config.twitch.bot?.auth?.name,
            connectedAccount:  'Bot: '+ (botTwitchAuthInfo?.authResult?.reason ??
             config.twitch.bot?.auth?.name),
            hasAuthToken: !!config.twitch.bot?.auth?.name,
            isValid: botTwitchAuthInfo?.authResult?.valid,
            validUntil: readableSeconds(botTwitchAuthInfo?.authResult?.expires_in).string,
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
            isConfigured: !!config.obs?.hostname,
            connectedAccount: config.obs?.hostname,
            hasAuthToken: !!config.obs?.password,
            isValid: !!config.obs?.hostname,
            openConfig: () => this.dialogService.openObsConnectionDialog()
          },
        ]
      } as Record<string, ConnectionEntry[]>;
    })
  );

  originalOrder = (a: unknown, b: unknown): number => {
    return 0;
  }

  constructor(private dialogService: DialogService,
              private appQuery: AppQueries,
              private appService: AppService,
              private configService: ConfigService
              ) { }

  ngOnInit(): void {
  }

}
