import {ErrorHandlerModule} from "../../app/error-handler/error-handler.module";
import {NgErrorOverlayModule} from "@gewd/ng-utils/ng-error-overlay";

export { ErrorHandlerModule }; // Export needed otherwise angular/webpack cant find this type/file..

export const ENVIRONMENT_MODULES = [
  NgErrorOverlayModule,
  // ErrorHandlerModule
];
