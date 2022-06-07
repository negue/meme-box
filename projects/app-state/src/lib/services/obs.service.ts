import {Injectable} from "@angular/core";
import {ACTIONS, ENDPOINTS} from "@memebox/contracts";
import {MemeboxApiService, MemeboxWebsocketService} from "@memebox/app-state";

@Injectable({
  providedIn: "root"
})
export class ObsService {
  constructor(
    private memeboxApi: MemeboxApiService,
    private memeboxWS: MemeboxWebsocketService
  ) {
  }

  public triggerReloadObsScreen(screenName: string) {
    this.memeboxApi.post(`${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.REFRESH_BROWSER_SOURCE}/${screenName}`, null, null);
  }

  // TODO Update the OBS ScreenNames to the State so that this Method can be removed

  public triggerReloadScreen(screenId: string | null): void  {
    this.memeboxWS.sendToTheSocket(`${ACTIONS.RELOAD_SCREEN}=${screenId}`);
  }
}
