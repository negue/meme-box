import {NgModule} from "@angular/core";
import {HoverClassDirective} from "./hover-class.directive";
import {HighlightDirective} from "./highlight.directive";

@NgModule({
  exports: [
    HoverClassDirective,
    HighlightDirective
  ],
  declarations: [
    HoverClassDirective,
    HighlightDirective
  ]
})
export class DirectivesModule {

}
