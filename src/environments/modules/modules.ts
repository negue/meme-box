import {ErrorHandlerModule} from "../../app/error-handler/error-handler.module";
import {AkitaNgDevtools} from "@datorama/akita-ngdevtools";

export { ErrorHandlerModule }; // Export needed otherwise angular/webpack cant find this type/file..

export const ENVIRONMENT_MODULES = [
  // NgErrorOverlayModule,
  AkitaNgDevtools.forRoot()
  // ErrorHandlerModule
];
