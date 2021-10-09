import {NgModule} from "@angular/core";
import {RegisterIconsModule} from "@gewd/mat-utils/material-icons";
import {APP_ICONS} from "./app.icons";


@NgModule({
  imports: [
    RegisterIconsModule.register({
      iconArray: APP_ICONS,
      pathToIcons: './assets/material-icons'
    }),
    RegisterIconsModule.register({
      iconArray: ['twitch'],
      pathToIcons: './assets/'
    }),
  ]
})
export class IconsModule {

}
