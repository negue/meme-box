import {NgModule, Optional, SkipSelf} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NetworkInterfacesService} from "./network-interfaces.service";
import {SettingsService} from "./settings.service";
import {SnackbarService} from "./snackbar.service";
import {WebsocketService} from "./websocket.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  providers: [
    NetworkInterfacesService,
    SettingsService,
    SnackbarService,
    WebsocketService
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
