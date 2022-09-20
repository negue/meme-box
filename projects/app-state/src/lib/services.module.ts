import {NgModule, Optional, SkipSelf} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NetworkInterfacesService} from "./services/network-interfaces.service";
import {SettingsService} from "./services/settings.service";
import {MemeboxWebsocketService} from "./services/memebox-websocket.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {SnackbarService} from "./services/snackbar.service";
import {AppQueries} from "./state";
import {AppService} from "./state/app.service";
import {ConfigService} from "./services/config.service";
import {ErrorsService, GithubService} from "./services";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  providers: [
    NetworkInterfacesService,
    SettingsService,
    SnackbarService,
    MemeboxWebsocketService,

    AppQueries,
    AppService,
    ConfigService,
    GithubService,
    ErrorsService
  ]
})
export class ServicesModule {
  constructor(@Optional() @SkipSelf() parentModule?: ServicesModule) {
    if (parentModule) {
      throw new Error(
        'ServicesModule is already loaded. Import it in the AppModule only');
    }
  }
}
