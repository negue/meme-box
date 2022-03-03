import {Injectable} from "@angular/core";
import {ActionStore, ActionStoreAdapter} from "@memebox/shared-state";
import {API_BASE, AppService} from "@memebox/app-state";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: "any"
})
export class WidgetStoreRemoteAdapter implements ActionStoreAdapter {
  constructor(
    private appService: AppService,
  ) {
  }

  getCurrentData(mediaId: string): Promise<ActionStore> {
    return this.appService.http.get<ActionStore>(`${API_BASE}widget-state/${mediaId}`)
      .pipe(
        take(1)
      ).toPromise();
  }

  updateData(mediaId: string, instanceId: string, newData: ActionStore) {
    this.appService.tryHttpPut(`${API_BASE}widget-state/${mediaId}/${instanceId}`, newData);
  }
}
