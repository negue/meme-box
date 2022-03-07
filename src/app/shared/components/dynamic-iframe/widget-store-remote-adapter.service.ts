import {Injectable} from "@angular/core";
import {ActionStore, ActionStoreAdapter} from "@memebox/shared-state";
import {AppService, MemeboxApiService} from "@memebox/app-state";

@Injectable({
  providedIn: "any"
})
export class WidgetStoreRemoteAdapter implements ActionStoreAdapter {
  constructor(
    private appService: AppService,
    private memeboxApi: MemeboxApiService,
  ) {
  }

  getCurrentData(mediaId: string): Promise<ActionStore> {
    return this.memeboxApi.get<ActionStore>(`widget-state/${mediaId}`);
  }

  updateData(mediaId: string, instanceId: string, newData: ActionStore) {
    this.memeboxApi.put(`widget-state/${mediaId}/${instanceId}`, newData);
  }
}
