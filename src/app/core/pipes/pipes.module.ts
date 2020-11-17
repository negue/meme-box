import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {SafePipe} from "./safe-url/safe-url.pipe";
import {ReplaceholderPipe} from './replaceholder.pipe';
import {ReadableMsPipe} from './readable-ms.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SafePipe, ReplaceholderPipe, ReadableMsPipe],
  exports: [SafePipe, ReplaceholderPipe, ReadableMsPipe],
})
export class PipesModule {}
