import {NgModule, Optional, SkipSelf} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NetworkInterfacesService} from "./services/network-interfaces.service";
import {SettingsService} from "./services/settings.service";
import {WebsocketService} from "./services/websocket.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {SnackbarService} from "./services/snackbar.service";
import {AppQueries} from "./state";
import {AppService} from "./state/app.service";
import {ConfigService} from "./services/config.service";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  providers: [
    NetworkInterfacesService,
    SettingsService,
    SnackbarService,
    WebsocketService,

    AppQueries,
    AppService,
    ConfigService
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
