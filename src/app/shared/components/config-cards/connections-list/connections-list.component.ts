import { Component } from '@angular/core';
import { DialogService } from "../../../dialogs/dialog.service";
import { combineLatest, Observable } from "rxjs";
import { AppQueries, AppService, ConfigService, ConnectionStateService } from "@memebox/app-state";
import { switchMap } from "rxjs/operators";
import { TwitchAuthInformation } from "@memebox/twitch-api";

interface ConnectionEntry {
  isConfigured: boolean;
  connectedAccount: string;
  hasAuthToken: boolean;
  isValid: boolean;
  validUntil?: string;
  openConfig: () => void;
}

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
export class ConnectionsListComponent {
  public config$ = this.appQuery.config$;


  groupedConnections$: Observable<Record<string, ConnectionEntry[]>> =
    combineLatest([
      this.config$,
      this.connectionStateService.isOffline$()
    ]).pipe(
      switchMap(async ([config, isOffline]) => {
        const authInformation = isOffline
          ? []
          : await this.configService.loadTwitchAuthInformations();

        const mainTwitchAuthInfo = authInformation?.find(a => a.type === 'main');
        const botTwitchAuthInfo = authInformation?.find(a => a.type === 'bot');

        const isTwitchConfigured = config.twitch?.channel
          ? config.twitch.channel.trim() !== ''
          : false;

        return {
          'Twitch': [
            {
              isConfigured: isTwitchConfigured,
              connectedAccount: `Main Account: ${mainTwitchAuthInfo?.authResult?.reason ??
              config.twitch.channel}`,
              hasAuthToken: !!config.twitch.token,
              ...this.generateConnectionMetaInfos(mainTwitchAuthInfo),
              openConfig: () => this.dialogService.openTwitchConnectionConfig()
            },
            {
              isConfigured: !!config.twitch.bot?.auth?.name,
              connectedAccount: `Bot Account: ${botTwitchAuthInfo?.authResult?.reason ??
              config.twitch.bot?.auth?.name}`,
              hasAuthToken: !!config.twitch.bot?.auth?.name,
              ...this.generateConnectionMetaInfos(botTwitchAuthInfo),
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
          */ 'OBS': [
            {
              isConfigured: !!config.obs?.hostname,
              connectedAccount: config.obs?.hostname,
              hasAuthToken: !!config.obs?.password,
              isValid: !!config.obs?.hostname,
              openConfig: () => this.dialogService.openObsConnectionDialog()
            }
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
              private configService: ConfigService,
              private connectionStateService: ConnectionStateService
  ) {
  }

  private generateConnectionMetaInfos(authInformation: TwitchAuthInformation): Partial<ConnectionEntry> {
    return {
      isValid: authInformation?.authResult?.valid,
      validUntil: authInformation?.authResult?.valid
        ? new Date(authInformation?.authResult?.expires_in_date).toLocaleString()
        : undefined
    }
  }
}
