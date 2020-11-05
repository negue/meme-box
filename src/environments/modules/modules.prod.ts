import {ErrorHandlerModule} from "../../app/error-handler/error-handler.module";

export { ErrorHandlerModule }; // Export needed otherwise angular/webpack cant find this type/file..

export const ENVIRONMENT_MODULES = [
  ErrorHandlerModule
];
