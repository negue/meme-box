import {Component} from '@angular/core';
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(updates: SwUpdate) {
    if (updates.isEnabled)   {
      updates.checkForUpdate();

      updates.available.subscribe(() => {
        console.info('update available');
        window.location.reload();
      });
    }
  }
}
