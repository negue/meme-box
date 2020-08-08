import {NgErrorOverlayModule} from "@gewd/ng-utils/ng-error-overlay";

export const AppConfig = {
  production: false,
  environment: 'DEV',
  ngModules: [
    NgErrorOverlayModule
  ]
};
