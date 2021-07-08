import {Injectable} from "@angular/core";
import {ActionStore, ActionStoreAdapter} from "@memebox/state";
import {API_BASE, AppService} from "../../../state/app.service";
import {take} from "rxjs/operators";

@Injectable()
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
