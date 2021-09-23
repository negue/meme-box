import {Component} from '@angular/core';
import {SwUpdate} from "@angular/service-worker";
import {ActionActivityService} from "../../projects/app-state/src/lib/activity-state/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // noinspection JSUnusedLocalSymbols
  constructor(updates: SwUpdate,
              // needs to be injected, so that it listens to changes
              activityService: ActionActivityService
  ) {
    if (updates.isEnabled)   {
      updates.checkForUpdate();

      updates.available.subscribe(() => {
        console.info('update available');
        window.location.reload();
      });
    }
  }
}
