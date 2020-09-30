import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {SafePipe} from "./safe-url/safe-url.pipe";
import {ReplaceholderPipe} from './replaceholder.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SafePipe, ReplaceholderPipe],
  exports: [SafePipe, ReplaceholderPipe],
})
export class PipesModule {}
