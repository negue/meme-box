import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from "../state/app.service";
import { StateModule } from "../state/state.module";
import { ServicesModule } from "../core/services/services.module";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(private appService: AppService) {
    window.addEventListener('error', ev => {
      this.handleError(ev.error);
    });
  }

  handleError (error: Error): void {
    this.appService.postErrorToServer(error);
  }
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StateModule,
    ServicesModule
  ],
  providers: [
    ErrorHandlerService,
    {provide: ErrorHandler, useExisting: ErrorHandlerService},
  ]
})
export class ErrorHandlerModule { }
