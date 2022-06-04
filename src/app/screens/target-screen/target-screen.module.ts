import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TargetScreenComponent} from "./target-screen.component";
import {MediaToggleDirective} from "./media-toggle.directive";
import {MediaTypeClassPipe} from "./media-type-class.pipe";
import {MatIconModule} from "@angular/material/icon";
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {DynamicIframeModule} from "../../shared/components/dynamic-iframe/dynamic-iframe.module";
import {WidgetPipesModule} from "../../shared/widget-pipes/widget-pipes.module";

@NgModule({
  declarations: [
    TargetScreenComponent,
    MediaToggleDirective,
    MediaTypeClassPipe
  ],
  imports: [
    CommonModule,
    MatIconModule,
    UiComponentsPipesModule,
    DynamicIframeModule,
    WidgetPipesModule,
  ],
  exports: [
    TargetScreenComponent
  ]
})
export class TargetScreenModule {
}
